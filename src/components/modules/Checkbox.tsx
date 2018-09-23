import React from 'react';
import styled from "styled-components";
import THEME from "src/theme";
import { withProps } from "src/utils";


const StyledCheckbox = styled.input`
  margin-top: ${THEME.spacer.x2}px;
  position: relative;
  width: 0;
  height: 0;
  opacity: 0;
  margin-right: ${THEME.spacer.x3 + THEME.spacer.x1}px;
  display: inline-block;

  &:hover {
    cursor: pointer;
  }

`;

const StyledCheckboxSquare = withProps<{
  checked: boolean;
}>()(styled.div)`
  border-radius: ${THEME.borderRadius}px;
  position: absolute;
  top: 0;
  left: 0;
  width: 20px;
  height: 20px;
  background: white;
  border: 1px solid ${THEME.colors.primary};

  &:after {
    color: black;
    display: block;
    content: ${props => props.checked ? "'L'" : "''"};
    position: absolute;
    top: -4px;
    left: 5px;
    font-size: 17px;
    transform: scaleY(-1) rotate(-221deg);
  }

  &:hover {
    cursor: pointer;
  }

`;

const StyledLabel = styled.label`
  color: black;
  &:hover {
    cursor: pointer;
  }
`;

const StyledCheckboxContainer = styled.div`
  position: relative;
`;

const Checkbox: React.StatelessComponent<{
  id: string;
  checked: boolean;
  onChange: () => any;
}> = ({id, onChange, checked, children}) => {
  return (
    <StyledCheckboxContainer>
      <StyledCheckbox
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
      />
      <StyledCheckboxSquare
        checked={checked}
        onClick={onChange}
      />
      <StyledLabel htmlFor={id}>
        {children}
      </StyledLabel>
    </StyledCheckboxContainer>
  );
};

export default Checkbox;
