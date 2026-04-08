import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen'
import type { VariantProps } from 'class-variance-authority'
import { useEffect, useRef } from 'react'
import type { FetcherWithComponents } from 'react-router'
import { Button, type buttonVariants } from '~/components/ui/button'

function BuyNowButtonInner({
  fetcher,
  children,
  disabled,
  variant,
  size,
  className,
}: {
  fetcher: FetcherWithComponents<{ checkoutUrl?: string | null }>
  children: React.ReactNode
  disabled?: boolean
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  className?: string
}) {
  const prevStateRef = useRef(fetcher.state)

  useEffect(() => {
    if (prevStateRef.current !== 'idle' && fetcher.state === 'idle') {
      const checkoutUrl = fetcher.data?.checkoutUrl
      if (checkoutUrl) {
        window.location.href = checkoutUrl
      }
    }
    prevStateRef.current = fetcher.state
  }, [fetcher.state, fetcher.data])

  return (
    <Button
      type="submit"
      disabled={disabled ?? fetcher.state !== 'idle'}
      variant={variant}
      size={size}
      className={className}
    >
      {children}
    </Button>
  )
}

export function BuyNowButton({
  children,
  disabled,
  lines,
  variant = 'default',
  size = 'default',
  className,
}: {
  children: React.ReactNode
  disabled?: boolean
  lines: Array<OptimisticCartLineInput>
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  className?: string
}) {
  return (
    <CartForm route="/cart" inputs={{ lines }} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <BuyNowButtonInner
          fetcher={fetcher}
          disabled={disabled}
          variant={variant}
          size={size}
          className={className}
        >
          {children}
        </BuyNowButtonInner>
      )}
    </CartForm>
  )
}
