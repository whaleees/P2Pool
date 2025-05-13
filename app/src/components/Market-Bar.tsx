import { Search } from 'lucide-react'

const MarketTabOptions = [
  { label: 'JLP Market', value: 'jlp' },
  { label: 'Main Market', value: 'main' },
  { label: 'Ethena Market', value: 'ethena' },
  { label: 'Altcoins Market', value: 'altcoins' },
]

export default function MarketToolbar() {
  return (
    <div className="flex flex-col mt-10 border-b-1 border-t-1 border-slate-700">
      <div className="flex justify-between items-center p-10 px-20 font-semibold">
        <div className="text-slate-400 bg-slate-800 flex gap-10 p-5 text-sm rounded-2xl">
          {MarketTabOptions.map(({ label, value }) => (
            <button key={value} className="hover:text-sky-400 focus:outline-none transition">
              {label}
            </button>
          ))}
        </div>

        <div className="relative w-full max-w-xs">
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-5 pl-12 bg-slate-800 rounded-2xl text-slate-400 outline-none"
          />
          <Search className="absolute left-4 top-1/2 h-5 w-5 text-slate-400 transform -translate-y-1/2" />
        </div>
      </div>
    </div>
  )
}
