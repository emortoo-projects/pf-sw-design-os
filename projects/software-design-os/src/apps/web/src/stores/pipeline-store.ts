import { create } from 'zustand'

interface PipelineState {
  activeStageNumber: number
  editorDirty: boolean
  editorData: Record<string, unknown> | null
  userInput: string
  isInterviewing: boolean
  confirmRevertDialogOpen: boolean
  setActiveStageNumber: (num: number) => void
  setEditorDirty: (dirty: boolean) => void
  setEditorData: (data: Record<string, unknown> | null) => void
  setUserInput: (input: string) => void
  setIsInterviewing: (interviewing: boolean) => void
  setConfirmRevertDialogOpen: (open: boolean) => void
}

export const usePipelineStore = create<PipelineState>((set) => ({
  activeStageNumber: 1,
  editorDirty: false,
  editorData: null,
  userInput: '',
  isInterviewing: false,
  confirmRevertDialogOpen: false,
  // isInterviewing is managed by StageInterviewWrapper's useEffect (cleanup resets on unmount)
  setActiveStageNumber: (num) =>
    set({ activeStageNumber: num, editorDirty: false, editorData: null, userInput: '' }),
  setEditorDirty: (dirty) => set({ editorDirty: dirty }),
  setEditorData: (data) => set({ editorData: data }),
  setUserInput: (input) => set({ userInput: input }),
  setIsInterviewing: (interviewing) => set({ isInterviewing: interviewing }),
  setConfirmRevertDialogOpen: (open) => set({ confirmRevertDialogOpen: open }),
}))
