import { create } from 'zustand'

interface PipelineState {
  activeStageNumber: number
  editorDirty: boolean
  editorData: Record<string, unknown> | null
  userInput: string
  confirmRevertDialogOpen: boolean
  setActiveStageNumber: (num: number) => void
  setEditorDirty: (dirty: boolean) => void
  setEditorData: (data: Record<string, unknown> | null) => void
  setUserInput: (input: string) => void
  setConfirmRevertDialogOpen: (open: boolean) => void
}

export const usePipelineStore = create<PipelineState>((set) => ({
  activeStageNumber: 1,
  editorDirty: false,
  editorData: null,
  userInput: '',
  confirmRevertDialogOpen: false,
  setActiveStageNumber: (num) =>
    set({ activeStageNumber: num, editorDirty: false, editorData: null, userInput: '' }),
  setEditorDirty: (dirty) => set({ editorDirty: dirty }),
  setEditorData: (data) => set({ editorData: data }),
  setUserInput: (input) => set({ userInput: input }),
  setConfirmRevertDialogOpen: (open) => set({ confirmRevertDialogOpen: open }),
}))
