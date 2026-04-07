import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import type { Route } from './+types/pages.refund-policy';

export const meta: Route.MetaFunction = () => {
  return [{ title: 'Refund Policy' }];
};

export async function loader(_args: Route.LoaderArgs) {
  return {};
}

export default function RefundPolicyPage() {
  return (
    <div className="bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-6 md:px-8 lg:px-12 py-16 md:py-24">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12 md:mb-16"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif leading-tight text-foreground mb-8 md:mb-12">
          Refund Policy
        </h1>

        <div className="space-y-6 md:space-y-8 font-sans text-sm md:text-base leading-relaxed text-foreground">
          <p className="text-muted-foreground text-xs md:text-sm">
            Last updated: April 7, 2026
          </p>

          <p>
            We have a 30-day return policy, which means you have 30 days after receiving your item to request a return.
          </p>

          <p>
            To be eligible for a return, your item must be in the same condition that you received it, unworn or unused, with tags, and in its original packaging. You&apos;ll also need the receipt or proof of purchase.
          </p>

          <p>
            To start a return, you can contact us at{' '}
            <a
              href="mailto:adinaadnan12@gmail.com"
              className="text-foreground underline underline-offset-4 hover:no-underline transition-all"
            >
              adinaadnan12@gmail.com
            </a>
            , message us on WhatsApp at{' '}
            <a
              href="https://wa.me/923249680850"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:no-underline transition-all"
            >
              +92 324 9680850
            </a>
            , or send us a DM on Instagram at{' '}
            <a
              href="https://www.instagram.com/adina.household/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground underline underline-offset-4 hover:no-underline transition-all"
            >
              @adina.household
            </a>
            . Please note that returns will need to be sent to the following address, which we will provide upon approval of your return request.
          </p>

          <p>
            If your return is accepted, we&apos;ll send you a return shipping label, as well as instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.
          </p>

          <p>
            You can always contact us for any return question at{' '}
            <a
              href="mailto:adinaadnan12@gmail.com"
              className="text-foreground underline underline-offset-4 hover:no-underline transition-all"
            >
              adinaadnan12@gmail.com
            </a>
            .
          </p>

          <h2 className="text-xl md:text-2xl font-serif leading-snug text-foreground pt-4">
            Damages and Issues
          </h2>

          <p>
            Please inspect your order upon reception and contact us immediately if the item is defective, damaged or if you receive the wrong item, so that we can evaluate the issue and make it right.
          </p>

          <p>
            To be eligible for a refund due to damage or defect, you must provide us with a video proof of the unopened package and the damaged product, recorded on the day of receipt. Once we review and approve your claim, we will process your refund or arrange a replacement.
          </p>

          <h2 className="text-xl md:text-2xl font-serif leading-snug text-foreground pt-4">
            Exceptions / Non-Returnable Items
          </h2>

          <p>
            Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products). We also do not accept returns for hazardous materials, flammable liquids, or gases. Please get in touch if you have questions or concerns about your specific item.
          </p>

          <p>
            Unfortunately, we cannot accept returns on sale items or gift cards.
          </p>

          <h2 className="text-xl md:text-2xl font-serif leading-snug text-foreground pt-4">
            Exchanges
          </h2>

          <p>
            The fastest way to ensure you get what you want is to return the item you have, and once the return is accepted, make a separate purchase for the new item.
          </p>

          <h2 className="text-xl md:text-2xl font-serif leading-snug text-foreground pt-4">
            Refunds
          </h2>

          <p>
            We will notify you once we&apos;ve received and inspected your return, and let you know if the refund was approved or not. If approved, you&apos;ll be automatically refunded on your original payment method within 10 business days. Please remember it can take some time for your bank or credit card company to process and post the refund too.
          </p>

          <p>
            If more than 15 business days have passed since we&apos;ve approved your return, please contact us at{' '}
            <a
              href="mailto:adinaadnan12@gmail.com"
              className="text-foreground underline underline-offset-4 hover:no-underline transition-all"
            >
              adinaadnan12@gmail.com
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
