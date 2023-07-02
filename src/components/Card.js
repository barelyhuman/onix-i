import { styled } from 'goober'

const Card = styled('div')`
  border-radius: 4px;
  padding: 16px;
  border: 1px solid #000;
  box-shadow: 0px 2px 8px rgba(12, 12, 13, 0.1);
  min-width: 65%;
  width: auto;
  display: inline-block;
  max-width: 80%;

  &.danger {
    border-color: #ee000066;
    color: #ee0000aa;
  }
  &.info {
    border-color: #d7827e;
    color: #d7827e;
  }
`

export default Card
