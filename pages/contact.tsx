import { getServerSideTranslations as serverSideTranslations, useTranslation } from '../components/utils/CloudflareI18n'
//
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale))
    }
  }
}

export default function ContactPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="container py-8">
        <h2 className="text-3xl font-bold text-white mb-8">Contact Us</h2>

        <form action="/submit-contact" method="POST" className="space-y-6">
          <div className="flex flex-col space-y-2">
            <label htmlFor="name" className="text-gray-200">
              Name:
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="email" className="text-gray-200">
              Email:
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label htmlFor="message" className="text-gray-200">
              Message:
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              required
              className="bg-gray-700 rounded-lg p-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200">
            Send Message
          </button>
        </form>

        <div className="mt-8 italic text-gray-400">
          For the moment, contacting us is useless. Later, you will be able to contact us through the web interface.
        </div>
      </div>
    </div>
  )
}
