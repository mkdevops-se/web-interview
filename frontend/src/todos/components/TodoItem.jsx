import { TextField, Checkbox, CircularProgress, Box, Button, Typography } from '@mui/material'

import DeleteIcon from '@mui/icons-material/Delete'

export const TodoItem = ({
  id,
  index,
  itemTitle,
  completed,
  isSavingItemId,
  handleTitleUpdate,
  handleDeleteItem,
  handleToggleDone,
}) => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <Typography sx={{ margin: '8px' }} variant='h6'>
      {index + 1}
    </Typography>
    <TextField
      sx={{ flexGrow: 1, marginTop: '1rem' }}
      label='What to do?'
      value={itemTitle}
      onChange={(event) => handleTitleUpdate(id, event.target.value)}
    />
    <Box width='15px'>
      {isSavingItemId === id && <CircularProgress size='15px' sx={{ ml: 2 }} />}
    </Box>
    <Button
      sx={{ margin: '8px' }}
      size='small'
      color='secondary'
      onClick={() => handleDeleteItem(id)}
    >
      <DeleteIcon />
    </Button>
    <Checkbox
      checked={completed}
      onChange={() => handleToggleDone(id, completed)}
      inputProps={{ 'aria-label': 'Mark as done' }}
    />
  </div>
)
