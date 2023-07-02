import { styled } from 'goober'

export const FormControl = styled('div')`
  width: auto;
  font-family: 'Inter';
  background-color: transparent;
  display: flex;
  flex-direction: column;
  padding: 8px 12px;
  border-radius: 6px;
  border: ${({ hideBorder }) => (hideBorder ? '0px' : '2px solid #e4e4e7')};
  color: #18181b;

  &:focus-within {
    border-color: #18181b;
  }

  & label {
    font-size: 0.9rem;
    color: #27272a;
    margin-bottom: 0.25rem;
  }

  & input,
  & textarea {
    font-family: inherit;
    letter-spacing: 0.05em;
    background: inherit;
    color: inherit;
    border: 0;
    outline: black;
    margin: 0;
    padding: 0;
    font-size: 1rem;
  }

  & input[type='checkbox'] {
    -webkit-appearance: none;
    appearance: none;
    background-color: var(--base);
    margin: 0px;
    padding: 0px;
    font: inherit;
    color: var(--surface);
    width: 1.15em;
    height: 1.15em;
    border: 0.15em solid var(--subtle);
    border-radius: 0.15em;
    transform: translateY(-0.075em);
    display: grid;
    place-content: center;
  }

  & input[type='checkbox']::before {
    content: '';
    width: 0.6em;
    height: 0.6em;
    transform: scale(0);
    transition: 120ms transform, border-color ease-in-out;
    box-shadow: inset 1em 1em var(--text);
  }

  & input[type='checkbox']:checked {
    border-color: var(--text);
  }

  & input[type='checkbox']:checked::before {
    transform: scale(1);
  }

  & select {
    position: relative;
    -webkit-appearance: none;
    min-width: 150px;
    font-family: inherit;
    color: inherit;
    font-size: 1rem;
    outline: black;
    background: transparent;
    border: 0px;
    background: transparent;
    background-image: url('data:image/svg+xml;base64,PHN2ZwogIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIKICB3aWR0aD0iMjQiCiAgaGVpZ2h0PSIyNCIKICB2aWV3Qm94PSIwIDAgMjQgMjQiCiAgZmlsbD0ibm9uZSIKICBzdHJva2U9ImN1cnJlbnRDb2xvciIKICBzdHJva2Utd2lkdGg9IjIiCiAgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIgogIHN0cm9rZS1saW5lam9pbj0icm91bmQiCj4KICA8cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT4KPC9zdmc+');
    background-repeat: no-repeat;
    background-position-x: 100%;
    background-position-y: 0px;
    padding-right: 3rem;
    letter-spacing: 0.05em;
  }
`
