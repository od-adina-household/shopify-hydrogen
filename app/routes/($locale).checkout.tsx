import { Money } from '@shopify/hydrogen'
import {
  CheckCircleIcon,
  GlobeIcon,
  TruckIcon,
  UploadCloudIcon,
} from 'lucide-react'
import { useRef, useState, useEffect } from 'react'
import {
  type ActionFunctionArgs,
  type FetcherWithComponents,
  type LoaderFunctionArgs,
  data,
  useFetcher,
  useLoaderData,
} from 'react-router'
import type { Route } from './+types/($locale).checkout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Progress } from '~/components/ui/progress'
import { Separator } from '~/components/ui/separator'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '~/components/ui/tabs'
import { CART_QUERY_FRAGMENT } from '~/lib/fragments'

export const meta: Route.MetaFunction = () => [
  { title: 'Checkout' },
  { name: 'robots', content: 'noindex' },
]

export async function loader({ context }: Route.LoaderArgs) {
  const { cart } = context
  const cartData = await cart.get()

  // Redirect to cart if cart is empty or has no lines
  if (!cartData || !cartData.lines?.nodes?.length) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: '/cart',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    })
  }

  return data(cartData, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

type ActionResponse =
  | { ok: true; intent: 'information' | 'bankTransferProof'; checkoutUrl?: string }
  | { ok: false; intent: 'information' | 'bankTransferProof'; errors: string[] }

export async function action({ request, context }: Route.ActionArgs) {
  const { cart } = context
  const formData = await request.formData()
  const intent = formData.get('intent') as string

  switch (intent) {
    case 'information': {
      const email = formData.get('email') as string
      const phone = formData.get('phone') as string
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string
      const address1 = formData.get('address1') as string
      const address2 = formData.get('address2') as string
      const city = formData.get('city') as string
      const province = formData.get('province') as string
      const zip = formData.get('zip') as string
      const country = formData.get('country') as string
      const deliveryOptionHandle = formData.get('deliveryOptionHandle') as string

      // ── Server-side validation ─────────────────────────────────────────────
      const errors: string[] = []
      if (!email) errors.push('Email is required')
      if (!address1) errors.push('Address is required')
      if (!city) errors.push('City is required')
      if (!zip) errors.push('ZIP / Postal Code is required')
      if (!country) errors.push('Country is required')
      if (!deliveryOptionHandle) errors.push('Please select a shipping method')

      if (errors.length > 0) {
        return data<ActionResponse>(
          { ok: false, intent: 'information', errors },
          { status: 422, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
      }

      // ── Mutation 1: Update buyer identity ──────────────────────────────────
      const identityResult = await cart.updateBuyerIdentity({
        email,
        phone,
        countryCode: country as any,
      })
      if (!identityResult.cart) {
        return data<ActionResponse>(
          { ok: false, intent: 'information', errors: ['Failed to update contact'] },
          { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
      }
      if (identityResult.userErrors?.length) {
        console.error('[checkout] updateBuyerIdentity userErrors:', identityResult.userErrors)
        const msgs = identityResult.userErrors.map((e) => e.message)
        return data<ActionResponse>(
          { ok: false, intent: 'information', errors: msgs },
          { status: 422, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
      }

      // ── Mutation 2: Add delivery address ───────────────────────────────────
      // Creates a new selectable address which triggers Shopify to compute
      // delivery groups and shipping options.
      let selectedDeliveryGroupId = ''
      if (address1) {
        const addressResult = await cart.addDeliveryAddresses([
          {
            address: {
              deliveryAddress: {
                address1: address1 || '',
                address2: address2 || '',
                city: city || '',
                provinceCode: province || '',
                zip: zip || '',
                countryCode: country as any,
              },
            },
            selected: true,
          },
        ])
        if (!addressResult.cart) {
          return data<ActionResponse>(
            { ok: false, intent: 'information', errors: ['Failed to add delivery address'] },
            { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
          )
        }
        if (addressResult.userErrors?.length) {
          console.error('[checkout] addDeliveryAddresses userErrors:', addressResult.userErrors)
          const msgs = addressResult.userErrors.map((e) => e.message)
          return data<ActionResponse>(
            { ok: false, intent: 'information', errors: msgs },
            { status: 422, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
          )
        }
        selectedDeliveryGroupId = addressResult.cart.deliveryGroups?.nodes?.[0]?.id || ''
      }

      // ── Mutation 3: Update shipping option ─────────────────────────────────
      if (selectedDeliveryGroupId && deliveryOptionHandle) {
        const shippingResult = await cart.updateSelectedDeliveryOption([
          { deliveryGroupId: selectedDeliveryGroupId, deliveryOptionHandle },
        ])
        if (!shippingResult.cart) {
          return data<ActionResponse>(
            { ok: false, intent: 'information', errors: ['Failed to update shipping option'] },
            { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
          )
        }
        if (shippingResult.userErrors?.length) {
          console.error('[checkout] updateSelectedDeliveryOption userErrors:', shippingResult.userErrors)
          const msgs = shippingResult.userErrors.map((e) => e.message)
          return data<ActionResponse>(
            { ok: false, intent: 'information', errors: msgs },
            { status: 422, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
          )
        }
      }

      return data<ActionResponse>(
        { ok: true, intent: 'information' },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
    }
    case 'bankTransferProof': {
      const objectKey = formData.get('objectKey') as string
      if (!objectKey) {
        return data<ActionResponse>(
          { ok: false, intent: 'bankTransferProof', errors: ['No proof uploaded'] },
          { status: 400, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
      }
      const result = await cart.setMetafields([
        { key: 'bank_transfer_proof_object_key', value: objectKey, type: 'single_line_text_field' },
      ])
      if (!result.cart) {
        return data<ActionResponse>(
          { ok: false, intent: 'bankTransferProof', errors: ['Failed to store proof'] },
          { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
      }
      if (result.errors?.length) {
        console.error('[checkout] setMetafields errors:', result.errors)
        return data<ActionResponse>(
          { ok: false, intent: 'bankTransferProof', errors: result.errors.map((e) => String(e)) },
          { status: 500, headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
        )
      }
      return data<ActionResponse>(
        { ok: true, intent: 'bankTransferProof', checkoutUrl: result.cart.checkoutUrl },
        { headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' } }
      )
    }
    default:
      throw new Error(`Unknown intent: ${intent}`)
  }
}

// ── UI ────────────────────────────────────────────────────────────────────────────

export default function Checkout() {
  const cartData = useLoaderData<typeof loader>()
  // Parent-level fetcher — the parent renders the form so useActionData()
  // can observe action results from InformationStep's submission.
  const fetcher = useFetcher<ActionResponse>()
  const [activeStep, setActiveStep] = useState('information')
  const [completedInfo, setCompletedInfo] = useState(false)
  const [formErrors, setFormErrors] = useState<string[]>([])
  const [proofObjectKey, setProofObjectKey] = useState<string>(
    (cartData as any)?.bankTransferProof?.value || ''
  )

  // Use fetcher data when reloaded after information submission, otherwise use loader data
  const cart = fetcher.data?.ok === true && fetcher.data?.intent === 'information' && fetcher.state === 'idle'
    ? cartData  // action succeeded but cart not yet refetched — use loader data
    : (fetcher.data as any)?.cart || cartData

  // Watch fetcher for information step completion — canonical pattern from CartSummary gift card
  useEffect(() => {
    if (fetcher.data?.ok && fetcher.data.intent === 'information') {
      setCompletedInfo(true)
      setActiveStep('review')
      setFormErrors([])
      // Refetch cart to get computed shipping options with prices
      const checkoutPath = import.meta.env.DEV ? '/checkout' : window.location.href
      fetcher.load(checkoutPath)
    } else if (fetcher.data?.ok === false && fetcher.data?.intent === 'information') {
      // Surface validation errors from the action
      setFormErrors((fetcher.data as any).errors || [])
    }
  }, [fetcher.data])

  // Sync proofObjectKey with cart metafield after reload
  useEffect(() => {
    const freshKey = (cart as any)?.bankTransferProof?.value
    if (freshKey && freshKey !== proofObjectKey) {
      setProofObjectKey(freshKey)
    }
  }, [(cart as any)?.bankTransferProof?.value])

  const progressPct = activeStep === 'information' ? 50 : 100

  return (
    <div className="mt-20 md:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-6 space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Checkout</h1>
        <p className="text-lg text-muted-foreground">Complete your order</p>
      </div>

      <Progress value={progressPct} className="mb-8" />

      <Tabs value={activeStep} onValueChange={(val) => {
        if (val === 'information' || completedInfo) {
          setActiveStep(val)
        }
      }}>
        <TabsList className="w-full bg-transparent p-0 h-auto gap-0">
          <TabsTrigger
            value="information"
            disabled={!completedInfo && activeStep !== 'information'}
            className="flex-1 data-[state=active]:bg-transparent border-b-2 data-[state=active]:border-b-primary rounded-none px-3 py-2 data-[state=active]:shadow-none text-sm"
          >
            <TruckIcon className="size-4 mr-2 inline" />
            Information
            {completedInfo && <CheckCircleIcon className="size-3 ml-2 text-green-500 inline" />}
          </TabsTrigger>
          <TabsTrigger
            value="review"
            disabled={!completedInfo}
            className="flex-1 data-[state=active]:bg-transparent border-b-2 data-[state=active]:border-b-primary rounded-none px-3 py-2 data-[state=active]:shadow-none text-sm data-[disabled]:opacity-40"
          >
            <CheckCircleIcon className="size-4 mr-2 inline" />
            Review & Pay
          </TabsTrigger>
        </TabsList>

        <TabsContent value="information" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <InformationStep
                fetcher={fetcher}
                initialEmail={(cart as any)?.buyerIdentity?.email || ''}
                initialPhone={(cart as any)?.buyerIdentity?.phone || ''}
                initialAddress={{
                  firstName: (cart as any)?.buyerIdentity?.firstName || '',
                  lastName: (cart as any)?.buyerIdentity?.lastName || '',
                  address1: (cart as any)?.buyerIdentity?.address?.address1 || '',
                  address2: (cart as any)?.buyerIdentity?.address?.address2 || '',
                  city: (cart as any)?.buyerIdentity?.address?.city || '',
                  province: (cart as any)?.buyerIdentity?.address?.province || '',
                  zip: (cart as any)?.buyerIdentity?.address?.zip || '',
                  country: (cart as any)?.buyerIdentity?.countryCode || 'PK',
                }}
                deliveryGroups={(cart as any)?.deliveryGroups?.nodes || []}
                formErrors={formErrors}
              />
            </div>
            <div className="lg:col-span-1 order-1 lg:order-2">
              <OrderSummary cart={cart} />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="review" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 order-2 lg:order-1">
              <ReviewStep
                cart={cart}
                proofObjectKey={proofObjectKey}
                onObjectKeyReady={setProofObjectKey}
                onBack={() => setActiveStep('information')}
              />
            </div>
            <div className="lg:col-span-1 order-1 lg:order-2">
              <OrderSummary cart={cart} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Step components ──────────────────────────────────────────────────────────────

import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

function InformationStep({
  fetcher,
  initialEmail,
  initialPhone,
  initialAddress,
  deliveryGroups,
  formErrors,
}: {
  fetcher: FetcherWithComponents<ActionResponse>
  initialEmail: string
  initialPhone: string
  initialAddress: {
    firstName: string; lastName: string; address1: string; address2: string
    city: string; province: string; zip: string; country: string
  }
  deliveryGroups: any[]
  formErrors: string[]
}) {
  const isSubmitting = fetcher.state !== 'idle'
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [country, setCountry] = useState(initialAddress.country || 'PK')

  const groupId = deliveryGroups[0]?.id || ''
  const shippingOptions = deliveryGroups.flatMap((g: any) =>
    (g.deliveryOptions || []).map((opt: any) => ({
      handle: opt.handle,
      title: opt.title,
      description: opt.description,
      price: opt.estimatedCost,
    }))
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Information & Shipping</CardTitle>
      </CardHeader>
      <CardContent>
        {formErrors.length > 0 && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 space-y-1">
            {formErrors.map((err, i) => (
              <p key={i} className="text-sm">{err}</p>
            ))}
          </div>
        )}
        <div className="space-y-6">
          <fetcher.Form method="post" className="space-y-6">
            <input type="hidden" name="intent" value="information" />
            <input type="hidden" name="deliveryGroupId" value={groupId} />
            <input type="hidden" name="deliveryOptionHandle" value={selectedShipping} />

            {/* Contact */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" name="email" type="email" defaultValue={initialEmail} placeholder="you@example.com" required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input id="phone" name="phone" type="tel" defaultValue={initialPhone} placeholder="0300 1234567" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Address */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Shipping Address</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" name="firstName" defaultValue={initialAddress.firstName} />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" name="lastName" defaultValue={initialAddress.lastName} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address1">Address</Label>
                <Input id="address1" name="address1" defaultValue={initialAddress.address1} placeholder="123 Main St" required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="address2">Apt, suite, etc. (optional)</Label>
                <Input id="address2" name="address2" defaultValue={initialAddress.address2} placeholder="Apt 4B" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={initialAddress.city} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="province">Province</Label>
                  <Select name="province" defaultValue={initialAddress.province} required>
                    <SelectTrigger><SelectValue placeholder="Select province" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Balochistan">Balochistan</SelectItem>
                      <SelectItem value="Punjab">Punjab</SelectItem>
                      <SelectItem value="Sindh">Sindh</SelectItem>
                      <SelectItem value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</SelectItem>
                      <SelectItem value="Gilgit-Baltistan">Gilgit-Baltistan</SelectItem>
                      <SelectItem value="Azad Kashmir">Azad Kashmir</SelectItem>
                      <SelectItem value="Islamabad Capital Territory">Islamabad Capital Territory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="zip">ZIP / Postal Code</Label>
                  <Input id="zip" name="zip" defaultValue={initialAddress.zip} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="country">Country</Label>
                  <Select name="country" defaultValue={country} onValueChange={(v) => setCountry(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PK">Pakistan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Shipping Method */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Shipping Method</h3>
              {deliveryGroups.length === 0 ? (
                <p className="text-sm text-muted-foreground">Add items to your cart to see available shipping options.</p>
              ) : shippingOptions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No shipping options available for this address. Please ensure your shipping address is complete.</p>
              ) : (
                <div className="space-y-2">
                  {shippingOptions.map((opt: any) => (
                    <label
                      key={opt.handle}
                      className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedShipping === opt.handle
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shippingOpt"
                          value={opt.handle}
                          checked={selectedShipping === opt.handle}
                          onChange={() => setSelectedShipping(opt.handle)}
                          className="accent-primary"
                          required
                        />
                        <div>
                          <p className="font-medium text-sm">{opt.title}</p>
                          {opt.description && (
                            <p className="text-xs text-muted-foreground">{opt.description}</p>
                          )}
                        </div>
                      </div>
                      <p className="text-sm font-medium">
                        {opt.price?.amount === '0.00' ? 'Free' : opt.price ? <Money data={opt.price} /> : '—'}
                      </p>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? 'Saving...' : 'Continue to Review'}
            </Button>
          </fetcher.Form>
        </div>
      </CardContent>
    </Card>
  )
}

function ReviewStep({
  cart,
  proofObjectKey,
  onObjectKeyReady,
  onBack,
}: {
  cart: any
  proofObjectKey: string
  onObjectKeyReady: (key: string) => void
  onBack: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedKey, setUploadedKey] = useState(proofObjectKey)
  const [placing, setPlacing] = useState(false)

  async function handleFileUpload(file: File) {
    setUploadError('')
    setUploading(true)
    try {
      const urlRes = await fetch(
        `/api/r2/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      )
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, objectKey } = await urlRes.json() as { uploadUrl: string; objectKey: string }

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      })
      if (!uploadRes.ok) throw new Error('R2 upload failed')

      setUploadedKey(objectKey)
      onObjectKeyReady(objectKey)
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handlePlaceOrder() {
    setPlacing(true)
    try {
      if (uploadedKey) {
        const fd = new FormData()
        fd.set('intent', 'bankTransferProof')
        fd.set('objectKey', uploadedKey)
        // Fire and forget — don't block redirect on failure
        await fetch('/checkout', { method: 'POST', body: fd }).catch(() => {})
      }
      if (cart?.checkoutUrl) {
        window.location.href = cart.checkoutUrl
      }
    } catch {
      setPlacing(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">

        {/* Line items */}
        <div className="space-y-3">
          {cart?.lines?.nodes?.map((line: any) => (
            <div key={line.id} className="flex gap-3">
              {line.merchandise?.image && (
                <img
                  src={line.merchandise.image.url}
                  alt={line.merchandise.title}
                  className="size-14 object-cover rounded border"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{line.merchandise?.product?.title}</p>
                {line.merchandise?.title !== 'Default Title' && (
                  <p className="text-xs text-muted-foreground">{line.merchandise.title}</p>
                )}
                <p className="text-xs text-muted-foreground">Qty: {line.quantity}</p>
              </div>
              <p className="text-sm font-medium shrink-0">
                <Money data={line.cost.totalAmount} />
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals — includes discounts & gift cards */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <div>{cart?.cost?.subtotalAmount ? <Money data={cart.cost.subtotalAmount} /> : '—'}</div>
          </div>
          {cart?.discountCodes?.filter((d: any) => d.applicable)?.length > 0 && (
            <div className="flex justify-between text-green-600 dark:text-green-400">
              <span>Discount</span>
              <div>{cart.discountCodes.find((d: any) => d.applicable)?.code}</div>
            </div>
          )}
          {cart?.appliedGiftCards?.map((giftCard: any) => (
            <div key={giftCard.id} className="flex justify-between text-green-600 dark:text-green-400">
              <span>Gift Card (*** {giftCard.lastCharacters})</span>
              <div><Money data={giftCard.amountUsed} /></div>
            </div>
          ))}
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <div>{cart?.cost?.totalTaxAmount ? <Money data={cart.cost.totalTaxAmount} /> : '—'}</div>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <div>{cart?.cost?.totalAmount ? <Money data={cart.cost.totalAmount} /> : '—'}</div>
          </div>
        </div>

        <Separator />

        {/* Bank Transfer Proof — inline */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GlobeIcon className="size-4 text-muted-foreground" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Bank Transfer Proof
            </h3>
          </div>

          {uploadedKey && !uploadError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
              <CheckCircleIcon className="size-4" />
              <span className="text-sm font-medium">Proof uploaded — ready to place order</span>
            </div>
          ) : (
            <div className="space-y-2">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFileUpload(f) }}
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-4 text-center hover:border-primary/50 transition-colors"
              >
                <UploadCloudIcon className="size-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-xs text-muted-foreground mb-2">Drag & drop receipt or</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="block mx-auto text-xs"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f) }}
                />
              </div>
              {uploadError && <p className="text-xs text-red-500">{uploadError}</p>}
            </div>
          )}
        </div>

        <Separator />

        {/* Place Order */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground text-center">
            By placing your order, you will be redirected to Shopify's secure payment page.
          </p>
          <Button
            onClick={handlePlaceOrder}
            disabled={placing}
            className="w-full"
            size="lg"
          >
            {placing ? 'Redirecting...' : 'Place Order'}
          </Button>
        </div>

        <Button type="button" variant="ghost" onClick={onBack} className="w-full text-muted-foreground">
          Back to Information
        </Button>
      </CardContent>
    </Card>
  )
}

function OrderSummary({ cart }: { cart: any }) {
  const lines = cart?.lines?.nodes || []
  const subtotal = cart?.cost?.subtotalAmount
  const total = cart?.cost?.totalAmount

  return (
    <Card className="lg:sticky lg:top-4">
      <CardHeader>
        <CardTitle className="text-base">Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-3 max-h-[40vh] overflow-y-auto">
          {lines.map((line: any) => (
            <div key={line.id} className="flex gap-2">
              {line.merchandise?.image && (
                <div className="relative shrink-0">
                  <img
                    src={line.merchandise.image.url}
                    alt={line.merchandise.title}
                    className="size-12 object-cover rounded border"
                  />
                  <span className="absolute -top-1.5 -right-1.5 size-4 rounded-full bg-muted text-[10px] font-medium flex items-center justify-center">
                    {line.quantity}
                  </span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight line-clamp-2">{line.merchandise?.product?.title}</p>
                {line.merchandise?.title !== 'Default Title' && (
                  <p className="text-xs text-muted-foreground">{line.merchandise.title}</p>
                )}
              </div>
              <p className="text-sm font-medium shrink-0">
                <Money data={line.cost.totalAmount} />
              </p>
            </div>
          ))}
        </div>
        <Separator />
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <div>{subtotal ? <Money data={subtotal} /> : '—'}</div>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <div>{total ? <Money data={total} /> : '—'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}