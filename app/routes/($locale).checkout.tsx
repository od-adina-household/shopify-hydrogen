import { CartForm, Money } from '@shopify/hydrogen'
import {
  CheckCircleIcon,
  CreditCardIcon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  TruckIcon,
  UploadCloudIcon,
} from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import {
  type ActionFunctionArgs,
  type LoaderFunctionArgs,
  data,
  redirect,
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
import { Textarea } from '~/components/ui/textarea'
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
    case 'contact': {
      const email = formData.get('email') as string
      const phone = formData.get('phone') as string
      const result = await cart.updateBuyerIdentity({
        email,
        phone,
      })
      if (!result.cart) throw new Error('Failed to update contact')
      return data({ ok: true })
    }
    case 'address': {
      const deliveryGroupId = formData.get('deliveryGroupId') as string
      const firstName = formData.get('firstName') as string
      const lastName = formData.get('lastName') as string
      const address1 = formData.get('address1') as string
      const address2 = formData.get('address2') as string
      const city = formData.get('city') as string
      const province = formData.get('province') as string
      const zip = formData.get('zip') as string
      const country = formData.get('country') as string

      const result = await cart.updateDeliveryAddresses([
        {
          id: deliveryGroupId || '',
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
      if (!result.cart) throw new Error('Failed to update address')
      return data({ ok: true })
    }
    case 'shipping': {
      const deliveryGroupId = formData.get('deliveryGroupId') as string
      const deliveryOptionHandle = formData.get('deliveryOptionHandle') as string
      if (!deliveryGroupId || !deliveryOptionHandle) throw new Error('Missing delivery group or option')
      const result = await cart.updateSelectedDeliveryOption([
        {
          deliveryGroupId,
          deliveryOptionHandle,
        },
      ])
      if (!result.cart) throw new Error('Failed to update shipping')
      return data({ ok: true })
    }
    case 'bankTransferProof': {
      const objectKey = formData.get('objectKey') as string
      if (!objectKey) throw new Error('No proof uploaded')
      const result = await cart.setMetafields([
        {
          key: 'bank_transfer_proof_object_key',
          value: objectKey,
          type: 'single_line_text_field',
        },
      ])
      if (!result.cart) throw new Error('Failed to store proof')
      return data({ ok: true, checkoutUrl: result.cart.checkoutUrl })
    }
    default:
      throw new Error(`Unknown intent: ${intent}`)
  }
}

const STEPS = [
  { id: 'contact', label: 'Contact', icon: MailIcon },
  { id: 'address', label: 'Address', icon: MapPinIcon },
  { id: 'shipping', label: 'Shipping', icon: TruckIcon },
  { id: 'payment', label: 'Payment', icon: CreditCardIcon },
  { id: 'bank-transfer', label: 'Bank Transfer', icon: GlobeIcon },
  { id: 'confirmation', label: 'Confirmation', icon: CheckCircleIcon },
]

function stepIndex(id: string) {
  return STEPS.findIndex(s => s.id === id)
}

export default function Checkout() {
  const cart = useLoaderData<typeof loader>()
  const [activeStep, setActiveStep] = useState('contact')
  const [proofObjectKey, setProofObjectKey] = useState<string>(
    (cart as any)?.bankTransferProof?.value || ''
  )

  const currentIdx = stepIndex(activeStep)
  const progressPct = ((currentIdx + 1) / STEPS.length) * 100

  return (
    <div className="mt-20 md:mt-24 px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-12 max-w-4xl mx-auto">
      <div className="mb-8 space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Checkout</h1>
        <p className="text-lg text-muted-foreground">Complete your order</p>
      </div>

      <Progress value={progressPct} className="mb-8" />

      <Tabs value={activeStep} onValueChange={setActiveStep}>
        <TabsList className="flex-wrap justify-start w-full h-auto bg-transparent p-0 gap-0">
          {STEPS.map(({ id, label, icon: Icon }) => {
            const idx = stepIndex(id)
            const isActive = activeStep === id
            const isComplete = idx < currentIdx
            return (
              <TabsTrigger
                key={id}
                value={id}
                className="flex-1 min-w-[120px] text-xs sm:text-sm bg-transparent data-[state=active]:bg-transparent border-b-2 data-[state=active]:border-b-primary rounded-none px-2 py-2 data-[state=active]:shadow-none data-[state=active]:text-foreground"
              >
                <Icon className="size-4 mr-1 hidden sm:inline" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden">{idx + 1}</span>
                {isComplete && !isActive && (
                  <CheckCircleIcon className="size-3 ml-1 text-green-500 inline" />
                )}
              </TabsTrigger>
            )
          })}
        </TabsList>

        <TabsContent value="contact" className="mt-6">
          <ContactStep
            initialEmail={(cart as any)?.buyerIdentity?.email || ''}
            initialPhone={(cart as any)?.buyerIdentity?.phone || ''}
            onNext={() => setActiveStep('address')}
          />
        </TabsContent>

        <TabsContent value="address" className="mt-6">
          <AddressStep
            initial={{
              firstName: (cart as any)?.buyerIdentity?.firstName || '',
              lastName: (cart as any)?.buyerIdentity?.lastName || '',
              address1: (cart as any)?.buyerIdentity?.address?.address1 || '',
              address2: (cart as any)?.buyerIdentity?.address?.address2 || '',
              city: (cart as any)?.buyerIdentity?.address?.city || '',
              province: (cart as any)?.buyerIdentity?.address?.province || '',
              zip: (cart as any)?.buyerIdentity?.address?.zip || '',
              country: (cart as any)?.buyerIdentity?.address?.country || 'US',
            }}
            deliveryGroupId={(cart as any)?.deliveryGroups?.nodes?.[0]?.id || ''}
            onNext={() => setActiveStep('shipping')}
            onBack={() => setActiveStep('contact')}
          />
        </TabsContent>

        <TabsContent value="shipping" className="mt-6">
          <ShippingStep
            deliveryGroups={(cart as any)?.deliveryGroups?.nodes || []}
            onNext={() => setActiveStep('payment')}
            onBack={() => setActiveStep('address')}
            deliveryGroupId={(cart as any)?.deliveryGroups?.nodes?.[0]?.id || ''}
          />
        </TabsContent>

        <TabsContent value="payment" className="mt-6">
          <PaymentStep
            checkoutUrl={cart?.checkoutUrl}
            onNext={() => setActiveStep('bank-transfer')}
            onBack={() => setActiveStep('shipping')}
          />
        </TabsContent>

        <TabsContent value="bank-transfer" className="mt-6">
          <BankTransferStep
            initialObjectKey={proofObjectKey}
            onObjectKeyReady={setProofObjectKey}
            onNext={() => setActiveStep('confirmation')}
            onBack={() => setActiveStep('payment')}
          />
        </TabsContent>

        <TabsContent value="confirmation" className="mt-6">
          <ConfirmationStep
            cart={cart}
            proofObjectKey={proofObjectKey}
            onBack={() => setActiveStep('bank-transfer')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ── Step components ──────────────────────────────────────────────────────────────

import { Button } from '~/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '~/components/ui/select'

function ContactStep({
  initialEmail,
  initialPhone,
  onNext,
}: {
  initialEmail: string
  initialPhone: string
  onNext: () => void
}) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Information</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="contact" />
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              defaultValue={initialEmail}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone (optional)</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              defaultValue={initialPhone}
              placeholder="+1 (555) 000-0000"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Continue to Address'}
            </Button>
          </div>
        </fetcher.Form>
        {fetcher.data?.ok && onNext()}
      </CardContent>
    </Card>
  )
}

function AddressStep({
  initial,
  deliveryGroupId,
  onNext,
  onBack,
}: {
  initial: {
    firstName: string
    lastName: string
    address1: string
    address2: string
    city: string
    province: string
    zip: string
    country: string
  }
  deliveryGroupId: string
  onNext: () => void
  onBack: () => void
}) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shipping Address</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="address" />
          <input type="hidden" name="deliveryGroupId" value={deliveryGroupId} />
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" defaultValue={initial.firstName} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" defaultValue={initial.lastName} required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="address1">Address</Label>
            <Input id="address1" name="address1" defaultValue={initial.address1} placeholder="123 Main St" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address2">Apt, suite, etc. (optional)</Label>
            <Input id="address2" name="address2" defaultValue={initial.address2} placeholder="Apt 4B" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" defaultValue={initial.city} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">State / Province</Label>
              <Input id="province" name="province" defaultValue={initial.province} required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP / Postal Code</Label>
              <Input id="zip" name="zip" defaultValue={initial.zip} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select name="country" defaultValue={initial.country}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="MY">Malaysia</SelectItem>
                  <SelectItem value="SG">Singapore</SelectItem>
                  <SelectItem value="ID">Indonesia</SelectItem>
                  <SelectItem value="TH">Thailand</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Continue to Shipping'}
            </Button>
          </div>
        </fetcher.Form>
        {fetcher.data?.ok && onNext()}
      </CardContent>
    </Card>
  )
}

function ShippingStep({
  deliveryGroups,
  deliveryGroupId,
  onNext,
  onBack,
}: {
  deliveryGroups: any[]
  deliveryGroupId: string
  onNext: () => void
  onBack: () => void
}) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [selected, setSelected] = useState<string>('')
  const [groupId] = useState<string>(deliveryGroupId)

  const options = deliveryGroups.flatMap((g: any) =>
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
        <CardTitle>Shipping Method</CardTitle>
      </CardHeader>
      <CardContent>
        <fetcher.Form method="post" className="space-y-4">
          <input type="hidden" name="intent" value="shipping" />
          <input type="hidden" name="deliveryGroupId" value={groupId} />
          <input type="hidden" name="deliveryOptionHandle" value={selected} />
          {options.length === 0 ? (
            <p className="text-muted-foreground">No shipping options available.</p>
          ) : (
            <div className="space-y-3">
              {options.map((opt: any) => (
                <label
                  key={opt.handle}
                  className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                    selected === opt.handle
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="deliveryOption"
                      value={opt.handle}
                      checked={selected === opt.handle}
                      onChange={() => setSelected(opt.handle)}
                      className="accent-primary"
                      required
                    />
                    <div>
                      <p className="font-medium">{opt.title}</p>
                      {opt.carrier && (
                        <p className="text-sm text-muted-foreground">{opt.carrier}</p>
                      )}
                      {opt.estimatedDays && (
                        <p className="text-sm text-muted-foreground">
                          Est. {opt.estimatedDays}
                        </p>
                      )}
                    </div>
                  </div>
                  <p className="font-medium">
                    {opt.price?.amount === '0.00' ? (
                      'Free'
                    ) : (
                      opt.price ? (
                        <Money data={opt.price} />
                      ) : (
                        '—'
                      )
                    )}
                  </p>
                </label>
              ))}
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting || !selected}>
              {isSubmitting ? 'Saving...' : 'Continue to Payment'}
            </Button>
          </div>
        </fetcher.Form>
        {fetcher.data?.ok && onNext()}
      </CardContent>
    </Card>
  )
}

function PaymentStep({
  checkoutUrl,
  onNext,
  onBack,
}: {
  checkoutUrl?: string
  onNext: () => void
  onBack: () => void
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-muted-foreground">
          Payment is processed securely via Shopify. You will be redirected to complete your payment.
        </p>

        <div className="rounded-lg border p-4 space-y-3">
          <h3 className="font-medium">Accepted Payment Methods</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Credit / Debit Card (Visa, Mastercard, Amex)</li>
            <li>• Shop Pay</li>
            <li>• Apple Pay / Google Pay (if available)</li>
            <li>• Bank Transfer (via Proof Upload step)</li>
          </ul>
        </div>

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button onClick={onNext}>Proceed to Bank Transfer Proof</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function BankTransferStep({
  initialObjectKey,
  onObjectKeyReady,
  onNext,
  onBack,
}: {
  initialObjectKey: string
  onObjectKeyReady: (key: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const fetcher = useFetcher()
  const uploadFetcher = useFetcher()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [uploadedKey, setUploadedKey] = useState(initialObjectKey)

  async function handleFileUpload(file: File) {
    setUploadError('')
    setUploading(true)
    try {
      // 1. Get presigned PUT URL
      const urlRes = await fetch(
        `/api/r2/upload-url?filename=${encodeURIComponent(file.name)}&contentType=${encodeURIComponent(file.type)}`
      )
      if (!urlRes.ok) throw new Error('Failed to get upload URL')
      const { uploadUrl, objectKey } = await urlRes.json() as { uploadUrl: string; objectKey: string }

      // 2. PUT file directly to R2
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

  async function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) await handleFileUpload(file)
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!uploadedKey) {
      setUploadError('Please upload your proof of payment first')
      return
    }
    const formData = new FormData()
    formData.set('intent', 'bankTransferProof')
    formData.set('objectKey', uploadedKey)
    const result = await fetch('/checkout', {
      method: 'POST',
      body: formData,
    })
    if (result.ok) onNext()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bank Transfer Proof</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground text-sm">
            Please upload a screenshot or photo of your bank transfer receipt as proof of payment.
            This will be reviewed by our team before your order is processed.
          </p>

          {uploadedKey && !uploadError ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
              <CheckCircleIcon className="size-5" />
              <span className="text-sm font-medium">Proof uploaded successfully</span>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const file = fileInputRef.current?.files?.[0]
                if (file) handleFileUpload(file)
              }}
              className="space-y-3"
            >
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="border-2 border-dashed border-muted-foreground/30 rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
              >
                <UploadCloudIcon className="size-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">
                  Drag & drop your receipt image here, or
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.pdf"
                  className="block mx-auto text-sm"
                />
              </div>

              {uploadError && (
                <p className="text-sm text-red-500">{uploadError}</p>
              )}

              <Button type="submit" disabled={uploading}>
                {uploading ? 'Uploading...' : 'Upload Proof'}
              </Button>
            </form>
          )}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button onClick={handleFormSubmit} disabled={!uploadedKey || fetcher.state !== 'idle'}>
              {fetcher.state !== 'idle' ? 'Saving...' : 'Continue to Confirmation'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function ConfirmationStep({
  cart,
  proofObjectKey,
  onBack,
}: {
  cart: any
  proofObjectKey: string
  onBack: () => void
}) {
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'

  async function handleComplete() {
    const formData = new FormData()
    formData.set('intent', 'bankTransferProof')
    formData.set('objectKey', proofObjectKey || '')
    await fetch('/checkout', {
      method: 'POST',
      body: formData,
    })
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl
    }
  }

  const lines = cart?.lines?.nodes || []
  const subtotal = cart?.cost?.subtotalAmount
  const tax = cart?.cost?.totalTaxAmount
  const total = cart?.cost?.totalAmount

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Order</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Line items */}
        <div className="space-y-4">
          {lines.map((line: any) => (
            <div key={line.id} className="flex gap-4">
              {line.merchandise?.image && (
                <img
                  src={line.merchandise.image.url}
                  alt={line.merchandise.title}
                  className="size-16 object-cover rounded border"
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{line.merchandise?.product?.title}</p>
                <p className="text-sm text-muted-foreground">
                  {line.merchandise?.title !== 'Default Title'
                    ? line.merchandise.title
                    : ''}
                </p>
                <p className="text-sm">Qty: {line.quantity}</p>
              </div>
              <p className="font-medium">
                <Money data={line.cost.totalAmount} />
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Totals */}
        <div className="space-y-2 text-sm">
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

        {/* Bank transfer proof status */}
        {proofObjectKey && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400">
            <CheckCircleIcon className="size-5" />
            <span className="text-sm font-medium">Bank transfer proof attached</span>
          </div>
        )}

        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onBack}>
            Back
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isSubmitting}
            size="lg"
            className="flex-1"
          >
            {isSubmitting ? 'Redirecting...' : 'Complete Order via Shopify'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}