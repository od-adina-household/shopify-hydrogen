import { Money } from '@shopify/hydrogen'
import {
  CheckCircleIcon,
  GlobeIcon,
  TruckIcon,
  UploadCloudIcon,
} from 'lucide-react'
import { useRef, useState } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  useFetcher,
  useLoaderData,
} from 'react-router'
import type { Route } from './+types/($locale).checkout'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
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
  return data(cartData, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  })
}

export async function action({ request, context }: ActionFunctionArgs) {
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
      const deliveryGroupId = formData.get('deliveryGroupId') as string
      const deliveryOptionHandle = formData.get('deliveryOptionHandle') as string

      // 1. Update buyer identity
      const identityResult = await cart.updateBuyerIdentity({ email, phone })
      if (!identityResult.cart) throw new Error('Failed to update contact')

      // 2. Update address
      if (deliveryGroupId && address1) {
        await cart.updateDeliveryAddresses([
          {
            id: deliveryGroupId,
            address: {
              deliveryAddress: {
                firstName: firstName || '',
                lastName: lastName || '',
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
      }

      // 3. Update shipping option
      if (deliveryGroupId && deliveryOptionHandle) {
        const shippingResult = await cart.updateSelectedDeliveryOption([
          { deliveryGroupId, deliveryOptionHandle },
        ])
        if (!shippingResult.cart) throw new Error('Failed to update shipping')
      }

      return data({ ok: true })
    }
    case 'bankTransferProof': {
      const objectKey = formData.get('objectKey') as string
      if (!objectKey) throw new Error('No proof uploaded')
      const result = await cart.setMetafields([
        { key: 'bank_transfer_proof_object_key', value: objectKey, type: 'single_line_text_field' },
      ])
      if (!result.cart) throw new Error('Failed to store proof')
      return data({ ok: true, checkoutUrl: result.cart.checkoutUrl })
    }
    default:
      throw new Error(`Unknown intent: ${intent}`)
  }
}

// ── UI ────────────────────────────────────────────────────────────────────────────

export default function Checkout() {
  const cart = useLoaderData<typeof loader>()
  const [activeStep, setActiveStep] = useState('information')
  const [completedInfo, setCompletedInfo] = useState(false)
  const [proofObjectKey, setProofObjectKey] = useState<string>(
    (cart as any)?.bankTransferProof?.value || ''
  )

  const progressPct = activeStep === 'information' ? 50 : 100

  return (
    <div className="mt-20 md:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 max-w-7xl mx-auto">
      <div className="mb-6 space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Checkout</h1>
        <p className="text-lg text-muted-foreground">Complete your order</p>
      </div>

      <Progress value={progressPct} className="mb-8" />

      <Tabs value={activeStep} onValueChange={(val) => {
        // Block backward navigation only
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
                  country: (cart as any)?.buyerIdentity?.address?.country || 'US',
                }}
                deliveryGroups={(cart as any)?.deliveryGroups?.nodes || []}
                onComplete={() => setCompletedInfo(true)}
              />
            </div>
            {/* Order summary on mobile: top; on desktop: right column */}
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
  initialEmail,
  initialPhone,
  initialAddress,
  deliveryGroups,
  onComplete,
}: {
  initialEmail: string
  initialPhone: string
  initialAddress: {
    firstName: string; lastName: string; address1: string; address2: string
    city: string; province: string; zip: string; country: string
  }
  deliveryGroups: any[]
  onComplete: () => void
}) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [selectedShipping, setSelectedShipping] = useState<string>('')
  const [country, setCountry] = useState(initialAddress.country || 'US')

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
                <Input id="phone" name="phone" type="tel" defaultValue={initialPhone} placeholder="+1 (555) 000-0000" />
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
              <Input id="address1" name="address1" defaultValue={initialAddress.address1} placeholder="123 Main St" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address2">Apt, suite, etc. (optional)</Label>
              <Input id="address2" name="address2" defaultValue={initialAddress.address2} placeholder="Apt 4B" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="city">City</Label>
                <Input id="city" name="city" defaultValue={initialAddress.city} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="province">State / Province</Label>
                <Input id="province" name="province" defaultValue={initialAddress.province} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="zip">ZIP / Postal Code</Label>
                <Input id="zip" name="zip" defaultValue={initialAddress.zip} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="country">Country</Label>
                <Select name="country" defaultValue="PK" onValueChange={(v) => setCountry(v)}>
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
            {shippingOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">No shipping options available yet.</p>
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
            disabled={isSubmitting || !selectedShipping}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? 'Saving...' : 'Continue to Review'}
          </Button>
        </fetcher.Form>
        {fetcher.data?.ok && onComplete()}
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
  const fetcher = useFetcher()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedKey, setUploadedKey] = useState(proofObjectKey)
  const [placing, setPlacing] = useState(false)

  const lines = cart?.lines?.nodes || []
  const subtotal = cart?.cost?.subtotalAmount
  const tax = cart?.cost?.totalTaxAmount
  const total = cart?.cost?.totalAmount

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
        await fetch('/checkout', { method: 'POST', body: fd })
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
          {lines.map((line: any) => (
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

        {/* Totals */}
        <div className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{subtotal ? <Money data={subtotal} /> : '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{tax ? <Money data={tax} /> : '—'}</span>
          </div>
          <Separator />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{total ? <Money data={total} /> : '—'}</span>
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
            <span>{subtotal ? <Money data={subtotal} /> : '—'}</span>
          </div>
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{total ? <Money data={total} /> : '—'}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}