import { observer } from 'mobx-react-lite'
import { Tree } from './tree/Tree'
import { Nav } from './editor/Nav'
import { EditorFrame } from '../editor/EditorFrame'
import { useCallback } from 'react'
import { Set } from './set/Set'
import { About } from '../About'
import { Characters } from './editor/Characters'
import { QuickOpen } from './QuickOpen'
import { action } from 'mobx'
import { useSystemMenus } from '../hooks/menu'
import { Tabs } from './editor/Tabs'
import { isWindows } from '../utils'
import { ConfirmDialog } from './Dialog/ConfirmDialog'
import { EditSpace } from './space/EditSpace'
import { EditFolderDialog } from './tree/EditFolderDialog'
import { Tools } from './tools/Tools'
import { useSystemKeyboard } from '../hooks/keyboard'
import { useCoreContext } from '../store/core'

export const Home = observer(() => {
  const core = useCoreContext()
  useSystemMenus()
  useSystemKeyboard()
  const moveStart = useCallback((e: React.MouseEvent) => {
    const left = e.clientX
    const startWidth = core.tree.width
    document.documentElement.classList.add('move')
    const move = action((e: MouseEvent) => {
      let width = startWidth + (e.clientX - left)
      if (width < 240) width = 240
      if (width > 500) width = 500
      core.tree.width = width
    })
    window.addEventListener('mousemove', move)
    window.addEventListener(
      'mouseup',
      () => {
        window.removeEventListener('mousemove', move)
        document.documentElement.classList.remove('move')
        localStorage.setItem('tree-width', String(core.tree.width))
      },
      { once: true }
    )
  }, [])

  return (
    <div className={`flex h-screen overflow-hidden ${isWindows ? 'win' : ''}`}>
      <Tree />
      <div
        className={
          'fixed w-1 bg-transparent z-[200] left-0 top-0 h-screen -ml-0.5 cursor-col-resize select-none'
        }
        style={{ left: core.tree.width }}
        onMouseDown={moveStart}
      />
      <div
        className={'flex-1 flex flex-col relative z-[100]'}
        style={{
          width: 0,
          minWidth: 300
        }}
      >
        <Nav />
        <Tabs />
        {core.tree.tabs.map((t) => (
          <div
            className={`flex-1 overflow-y-auto overflow-x-hidden items-start ${
              core.tree.currentTab === t ? 'h-full' : 'opacity-0 fixed w-0 h-0 pointer-events-none'
            }`}
            style={{
              contentVisibility: core.tree.currentTab === t ? 'inherit' : 'hidden'
            }}
            key={t.id}
          >
            <EditorFrame tab={t} />
          </div>
        ))}
        <Tools />
        <Characters />
      </div>
      <About />
      <Set />
      <QuickOpen />
      <ConfirmDialog />
      <EditSpace />
      <EditFolderDialog />
    </div>
  )
})
