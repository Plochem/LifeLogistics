import { AddBox } from '@mui/icons-material'
import { LoadingButton } from '@mui/lab'
import { Box, Chip, Stack, TextField, Typography } from '@mui/material'
import { useEffect, useState } from 'react'

type Props = {
  setTags: React.Dispatch<React.SetStateAction<string[]>>
  tags: string[]
}

const CalendarTags = ({ setTags, tags }: Props) => {
  const [tag, setTag] = useState('')
  const [isValid, setValid] = useState(false)

  const validateInput = () => {
    if (tag === '' || tags.includes(tag)) return false
    return true
  }

  useEffect(() => {
    setValid(validateInput())
  }, [tag])

  const handleAddTagChild = () => {
    setTags((prev) => [...prev, tag])
    setTag('')
  }
  const handleDeleteTagChild = (index: number) => {
    setTags((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <TextField
        margin="normal"
        fullWidth
        label="Tag"
        value={tag}
        inputProps={{ style: { textTransform: 'lowercase' } }}
        onChange={(e) => setTag(e.target.value)}
      />
      <Box>
        <LoadingButton
          variant="outlined"
          endIcon={<AddBox />}
          onClick={handleAddTagChild}
          disabled={!isValid}
        >
          Add Tag
        </LoadingButton>
      </Box>
      <Box>
        <Stack direction="row" alignItems="center" my={1}>
          <Typography>Current Tags: </Typography>
        </Stack>
        <Box>
          {tags.map((element, index) => (
            <Chip
              key={element as string}
              label={element}
              onDelete={() => handleDeleteTagChild(index)}
              size="small"
              sx={{ m: 0.5 }}
            />
          ))}
        </Box>
      </Box>
    </>
  )
}
export default CalendarTags
