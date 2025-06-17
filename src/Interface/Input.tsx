import { forwardRef } from 'react'
import styled from 'styled-components/macro'

const StyledInput = styled.input`
   height: 2rem;
   width: 100%;
   margin: 0;
   flex: auto;
   & [readonly] {
      opacity: 0.4;
   }
   background-color: var(--input-bg);
   color: var(--input-text);
   border: 1px solid var(--input-border);
   padding: 10px;
   border-radius: 5px;
   ::placeholder {
      color: var(--input-placeholder);
   }
`

const Input = forwardRef<
   HTMLInputElement,
   React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
   return <StyledInput {...props} ref={ref} />
})

export default Input
