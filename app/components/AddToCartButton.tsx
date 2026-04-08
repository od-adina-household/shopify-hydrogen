import { CartForm, type OptimisticCartLineInput } from '@shopify/hydrogen'
import type { VariantProps } from 'class-variance-authority'
import { useEffect, useRef } from 'react'
import type { FetcherWithComponents } from 'react-router'
import { Button, type buttonVariants } from '~/components/ui/button'
import { gsap } from '~/lib/gsap'

function AddToCartButtonInner({
  fetcher,
  analytics,
  children,
  disabled,
  onClick,
  variant,
  size,
  className,
}: {
  fetcher: FetcherWithComponents<any>
  analytics?: unknown
  children: React.ReactNode
  disabled?: boolean
  onClick?: () => void
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  className?: string
}) {
  const prevStateRef = useRef(fetcher.state)
  const onClickRef = useRef(onClick)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    onClickRef.current = onClick
  }, [onClick])

  useEffect(() => {
    // Check if the fetcher just finished submitting (went from submitting/loading to idle)
    if (prevStateRef.current !== 'idle' && fetcher.state === 'idle') {
      // Scale feedback animation
      if (buttonRef.current) {
        gsap.fromTo(
          buttonRef.current,
          { scale: 0.95 },
          { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }
        )
      }
      // Form submission completed successfully, now call onClick
      onClickRef.current?.()
    }
    prevStateRef.current = fetcher.state
  }, [fetcher.state])

  return (
    <>
      <input name="analytics" type="hidden" value={JSON.stringify(analytics)} />
      <Button
        ref={buttonRef}
        type="submit"
        disabled={disabled ?? fetcher.state !== 'idle'}
        variant={variant}
        size={size}
        className={className}
      >
        {children}
      </Button>
    </>
  )
}

export function AddToCartButton({
  analytics,
  children,
  disabled,
  lines,
  onClick,
  variant = 'default',
  size = 'default',
  className,
}: {
  analytics?: unknown
  children: React.ReactNode
  disabled?: boolean
  lines: Array<OptimisticCartLineInput>
  onClick?: () => void
  variant?: VariantProps<typeof buttonVariants>['variant']
  size?: VariantProps<typeof buttonVariants>['size']
  className?: string
}) {
  return (
    <CartForm route="/cart" inputs={{ lines }} action={CartForm.ACTIONS.LinesAdd}>
      {(fetcher: FetcherWithComponents<any>) => (
        <AddToCartButtonInner
          fetcher={fetcher}
          analytics={analytics}
          disabled={disabled}
          onClick={onClick}
          variant={variant}
          size={size}
          className={className}
        >
          {children}
        </AddToCartButtonInner>
      )}
    </CartForm>
  )
}
