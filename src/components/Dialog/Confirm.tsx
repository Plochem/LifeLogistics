import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'

type ConfirmDialogProps = {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  danger?: boolean
}

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  danger,
}: ConfirmDialogProps) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>{title}</DialogTitle>
    <DialogContent>
      <DialogContentText>{message}</DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button
        onClick={onConfirm}
        autoFocus
        {...(danger ? { color: 'error' } : {})}
      >
        Confirm
      </Button>
    </DialogActions>
  </Dialog>
)

export default ConfirmDialog
