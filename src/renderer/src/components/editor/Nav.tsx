import { observer } from 'mobx-react-lite'
import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Fragment, useCallback, useEffect } from 'react'
import { action, runInAction } from 'mobx'
import { isMac, message$ } from '../../utils'
import { IMenu, openMenus } from '../Menu'
import { History } from './History'
import Collapse from '../../icons/Collapse'
import { Icon } from '@iconify/react'
import { MainApi } from '../../api/main'
import { useLocalState } from '../../hooks/useLocalState'
import { sep } from 'path'
import { Share } from '../../server/Share'
import { toMarkdown } from '../../editor/utils/toMarkdown'
import { Badge, Popover } from 'antd'
import { Update } from '../Update'
import { keyTask$ } from '../../hooks/keyboard'
import { IFileItem } from '../../types'
import INote from '../../icons/INote'
import { useCoreContext } from '../../store/core'
import { useTranslation } from 'react-i18next'

export const Nav = observer(() => {
  const core = useCoreContext()
  const {t} = useTranslation()
  const [state, setState] = useLocalState({
    path: [] as string[],
    openImport: false,
    exportFolder: false,
    openHistory: false,
    importMarkdown: false,
    drag: false,
    depLinks: [] as IFileItem[]
  })
  const getPath = useCallback(() => {
    if (core.tree.openedNote) {
      if (core.tree.openedNote.spaceId) {
        setState({
          path: core.tree.openedNote.filePath.replace(core.tree.root?.filePath! + sep, '').split(sep)
        })
        if (core.tree.openedNote) {
          const path = core.tree.openedNote.filePath
          if (core.tree.openedNote.spaceId) {
            requestIdleCallback(() => {
              const links = core.tree.getDepLinks(path)
              setState({ depLinks: links })
            })
          }
        }
      } else {
        setState({
          path: core.tree.openedNote.filePath.replace(core.config.homePath, '~').split(sep)
        })
      }
    } else {
      setState({path: []})
    }
  }, [])

  useEffect(() => {
    setTimeout(() => {
      getPath()
    }, 30)
  }, [core.tree.openedNote, core.tree.openedNote?.filePath])

  const checkOpenedNote = useCallback(() => {
    if (!core.tree.openedNote) {
      message$.next({
        type: 'warning',
        content: 'Please open at least one doc'
      })
      return false
    }
    return true
  }, [])
  return (
    <div
      className={`h-10 w-full drag-nav duration-200 select-none width-duration relative`}
      style={{
        paddingLeft: core.tree.blankMode ? (core.tree.fold ? 105 : 0) : core.tree.fold ? 45 : 35
      }}
      onClick={(e) => {
        if (e.detail === 2) {
          MainApi.maxSize()
        }
      }}
    >
      <div
        className={`absolute z-10 dark:hover:bg-gray-400/10 hover:bg-black/5 p-1 rounded drag-none duration-200`}
        style={{
          left: core.tree.blankMode ? (core.tree.fold ? 75 : -36) : 10,
          top: 7
        }}
        onClick={action(() => {
          core.tree.fold = !core.tree.fold
        })}
      >
        <Collapse
          className={'dark:stroke-gray-400 stroke-gray-500 w-[18px] h-[18px] cursor-pointer'}
        />
      </div>
      <div className={`justify-between relative flex nav items-center h-full flex-1`}>
        <div className={'flex items-center h-full flex-1 max-w-[calc(100%_-_90px)]'}>
          <div
            className={`text-gray-300 flex items-center text-sm select-none ${
              core.tree.fold ? '' : 'ml-3'
            }`}
          >
            <div
              className={`duration-200 cursor-pointer drag-none py-[3px] px-1 rounded ${
                core.tree.currentTab?.hasPrev
                  ? 'dark:text-gray-200 hover:bg-gray-400/10 text-gray-500'
                  : 'dark:text-gray-500 text-gray-300'
              }`}
              onClick={() => core.tree.navigatePrev()}
            >
              <LeftOutlined />
            </div>
            <div
              className={`duration-200 cursor-pointer drag-none py-[3px] px-1 rounded ${
                core.tree.currentTab?.hasNext
                  ? 'dark:text-gray-200 hover:bg-gray-400/10 text-gray-500'
                  : 'dark:text-gray-500 text-gray-300'
              }`}
              onClick={() => core.tree.navigateNext()}
            >
              <RightOutlined />
            </div>
          </div>
          {core.tree.root && !!state.depLinks.length && (
            <Popover trigger={['click']} title={null} overlayInnerStyle={{padding: 8}} arrow={false} content={(
              <div>
                {state.depLinks.map(d => {
                  return (
                    <div
                      key={d.filePath}
                      className={'flex items-center px-2 py-0.5 cursor-pointer rounded duration-200 dark:hover:bg-gray-100/10 hover:bg-gray-200/70'}
                      onClick={() => {
                        core.tree.openNote(d)
                      }}
                    >
                      <INote className={'flex-shrink-0'} />
                      <span className={'ml-1'}>{d.filePath.replace(core.tree.root?.filePath! + '/', '')}</span>
                    </div>
                  )
                })}
              </div>
            )}>
              <div
                className={
                  'ml-1 drag-none text-xl flex items-center dark:text-gray-400 text-gray-500 rounded hover:bg-gray-200/80 dark:hover:bg-gray-100/10 px-0.5 cursor-pointer duration-200'
                }
              >
                <Icon icon={'academicons:datacite'} />
                <span className={'text-base ml-1 text-blue-500'}>{state.depLinks.length}</span>
              </div>
            </Popover>
          )}
          <div
            className={
              'hide-scrollbar overflow-x-auto flex-1 w-0 ml-3 mr-3 dark:text-gray-400/80 text-gray-500 text-sm flex items-center h-full'
            }
          >
            {!!state.path.length && (
              <>
                {state.path.map((c, i) => (
                  <Fragment key={i}>
                    {i !== 0 && <span className={'mx-2 drag-none'}>/</span>}
                    <span
                      className={`${
                        i === state.path.length - 1 ? 'dark:text-gray-300 text-gray-600' : ''
                      } inline-block drag-none`}
                    >
                      {i === state.path.length - 1 ? c.replace(/\.\w+/, '') : c}
                    </span>
                    {i === state.path.length - 1 && core.tree.currentTab?.store?.docChanged && (
                      <sup className={'ml-0.5'}>*</sup>
                    )}
                  </Fragment>
                ))}
              </>
            )}
          </div>
        </div>
        <div className={'flex items-center pr-3 dark:text-gray-300 space-x-1 text-gray-500'}>
          <Update />
          <Share />
          <div
            className={
              'flex items-center justify-center h-[27px] w-[30px] rounded dark:hover:bg-gray-200/10 hover:bg-gray-200/60 cursor-pointer duration-200 drag-none'
            }
            onClick={(e) => {
              const menus: IMenu[] = [
                {
                  text: 'Export To PDF',
                  disabled: core.tree.openedNote?.ext !== 'md',
                  click: () => {
                    if (core.tree.openedNote?.ghost) {
                      keyTask$.next({
                        key: 'save',
                        args: [
                          () =>
                            window.electron.ipcRenderer.send(
                              'print-pdf',
                              core.tree.openedNote?.filePath
                            )
                        ]
                      })
                    } else {
                      window.electron.ipcRenderer.send('print-pdf', core.tree.openedNote?.filePath)
                    }
                  }
                },
                {
                  text: 'Copy markdown source code',
                  disabled: core.tree.openedNote?.ext !== 'md',
                  click: async () => {
                    if (checkOpenedNote()) {
                      const md = toMarkdown(core.tree.openedNote?.schema || [])
                      window.api.copyToClipboard(md)
                      message$.next({
                        type: 'success',
                        content: t('copied')
                      })
                    }
                  }
                },
                { hr: true },
                {
                  text: 'File History',
                  click: () => setState({ openHistory: true }),
                  disabled: core.tree.openedNote?.ext !== 'md'
                },
                {
                  text: t('downloadRemote'),
                  disabled: core.tree.openedNote?.ext !== 'md',
                  click: () => {
                    core.file.convertRemoteImages(core.tree.openedNote!)
                  }
                },
                {
                  text: t('claerImage'),
                  disabled: !core.tree.root,
                  click: () => {
                    core.file.clear()
                  }
                },
                { hr: true },
                {
                  text: isMac ? 'Reveal in Finder' : 'Reveal in File Explorer',
                  disabled: !core.tree.openedNote || core.tree.openedNote?.ghost,
                  click: () => {
                    MainApi.showInFolder(core.tree.openedNote!.filePath)
                  }
                },
                {
                  text: t('openInDefault'),
                  click: () =>
                    window.electron.ipcRenderer.send(
                      'open-in-default-app',
                      core.tree.openedNote?.filePath
                    ),
                  disabled: !core.tree.openedNote || core.tree.openedNote?.ghost
                },
                {
                  text: 'Github',
                  click: () => {
                    window.open(`https://github.com/1943time/inkdown`)
                  }
                },
                { hr: true },
                {
                  text: 'Settings',
                  key: 'cmd+,',
                  click: action(() => (core.config.visible = true))
                }
              ]
              if (core.config.enableUpgrade) {
                menus.unshift({
                  text: 'Update Inkdown',
                  click: () => {
                    runInAction(() => {
                      core.config.openUpdateDialog = true
                    })
                  }
                })
              }
              openMenus(e, menus)
            }}
          >
            <Badge offset={[4, 1]} status={'warning'} dot={core.config.enableUpgrade}>
              <Icon icon={'uiw:more'} className={'text-lg dark:text-gray-300 text-gray-500'} />
            </Badge>
          </div>
        </div>
      </div>
      <History
        node={core.tree.openedNote}
        open={state.openHistory}
        onClose={() => setState({ openHistory: false })}
      />
    </div>
  )
})
