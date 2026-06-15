export default function Footer() {
  return (
    <footer className="mt-8 py-6 px-4 md:px-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 bg-[#16161a]/30">
      <p>© {new Date().getFullYear()} Railfan Archive Manager. Built for the community.</p>
      <div className="flex gap-4 mt-3 md:mt-0">
        <span className="hover:text-amber-500 transition-colors cursor-pointer">Privacy</span>
        <span className="hover:text-amber-500 transition-colors cursor-pointer">Terms</span>
        <span className="hover:text-amber-500 transition-colors cursor-pointer">Support</span>
        <span className="text-slate-600 border-l border-white/10 pl-4 ml-2">v1.1.0</span>
      </div>
    </footer>
  )
}
