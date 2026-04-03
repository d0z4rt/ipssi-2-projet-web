type TabOption<T extends string> = {
  value: T
  label: string
}

type TabBarProps<T extends string> = {
  tabs: TabOption<T>[]
  activeTab: T
  onChange: (tab: T) => void
  className?: string
}

export const TabBar = <T extends string>({
  tabs,
  activeTab,
  onChange,
  className = ''
}: TabBarProps<T>) => {
  return (
    <div className={`flex border-b border-gray-800 ${className}`.trim()}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          type="button"
          onClick={() => onChange(tab.value)}
          className={`px-6 py-3 text-sm font-medium transition-colors relative ${
            activeTab === tab.value
              ? 'text-accent'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          {tab.label}
          {activeTab === tab.value && (
            <div className="absolute bottom-0 left-0 h-0.5 w-full bg-accent"></div>
          )}
        </button>
      ))}
    </div>
  )
}
