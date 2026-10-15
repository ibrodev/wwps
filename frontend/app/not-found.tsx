import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='flex flex-col justify-center items-center h-screen w-full overflow-hidden'>
      <h2 className='text-9xl text-gray-500'>404</h2>
      <p className='uppercase text-gray-700'>Could not find requested resource</p>
      <Link href="/" className='underline text-eiar-green mt-2.5'>Return Home</Link>
    </div>
  )
}