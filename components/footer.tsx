import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-black py-4">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xs text-zinc-500">© {new Date().getFullYear()} Sorocast. All rights reserved.</div>
          <div className="flex gap-4">
            <Link href="/terms" className="text-xs text-zinc-500 hover:text-white">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-zinc-500 hover:text-white">
              Privacy
            </Link>
            <Link href="/faq" className="text-xs text-zinc-500 hover:text-white">
              FAQ
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
