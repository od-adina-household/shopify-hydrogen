export function WhatsAppWidget() {
  const phoneNumber = '923249680850'
  const message =
    'Hello! I visited adinahousehold.com and would love some assistance with my purchase.'
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-[#25d366] rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <img
        src="/whatsapp-svgrepo-com.svg"
        alt="WhatsApp"
        className="w-8 h-8 md:w-10 md:h-10"
        suppressHydrationWarning
      />
    </a>
  )
}
