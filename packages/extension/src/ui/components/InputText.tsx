import { ComponentPropsWithRef, ReactNode, RefObject, useRef } from 'react'
import { Controller, ControllerProps, FieldValues } from 'react-hook-form'
import styled, { css } from 'styled-components'

function randomString() {
  return Math.floor(Math.random() * 1000).toString()
}

const inputHeight = 60

export const InputText = styled(
  ({
    placeholder,
    type,
    onChange,
    autoFocus,
    value,
    disabled,
    className,
    style,
    inputRef,
    min,
    max,
    inputStyle,
    labelStyle,
    ...props
  }: ComponentPropsWithRef<typeof Input> & { inputRef?: RefObject<HTMLInputElement> }) => {
    const idRef = useRef(randomString())
    return (
      <Container className={className} style={style}>
        <Input
          placeholder={placeholder}
          id={idRef.current}
          min={min}
          max={max}
          type={type}
          onChange={onChange}
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          style={inputStyle}
          ref={inputRef}
          {...props}
        />
        <Label style={labelStyle}>{placeholder}</Label>
      </Container>
    )
  }
)``

export type InputFieldProps = Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'as'>

export const ControlledInputText = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  LeftComponent,
  children,
  ...props
}: ControlledInputProps<T>) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    rules={rules}
    render={({ field: { ref, value, ...field } }) => (
      <InputWrapper>
        {LeftComponent && <LeftComponentContainer>{LeftComponent}</LeftComponentContainer>}
        <InputText
          {...props}
          value={value || ''}
          {...field}
          inputStyle={{ paddingLeft: LeftComponent ? inputHeight : 'intial' }}
          labelStyle={{ marginLeft: LeftComponent ? inputHeight - 15 : 'intial' }}
        />
      </InputWrapper>
    )}
  />
)

interface AdditionalControlledInputProps {
  LeftComponent?: ReactNode
  children?: ReactNode
}

export type ControlledInputProps<T extends FieldValues> = InputFieldProps &
  Omit<ControllerProps<T>, 'render'> &
  AdditionalControlledInputProps

const Label = styled.label`
  color: ${({ theme }) => theme.text2};
  font-weight: 500;
  height: 20px;
  font-size: 17px;
  order: 1;
  pointer-events: none;
  text-shadow: none;
  transform-origin: left;
  transform: scale(1) translate3d(15px, 40px, 0);
  transition: all 0.15s ease-in-out;
  text-align: start;
`

const InputCss = css`
  border-radius: 0;
  display: flex;
  font-size: 17px;

  text-shadow: none;

  background-color: ${({ theme }) => theme.bg3};
  border-radius: 9px;
  border: 0;
  color: ${({ theme }) => theme.text1};

  padding: 0 15px;
  padding-top: 22px;
  padding-bottom: 5px;
  height: ${inputHeight}px;

  flex: 1 1 auto;
  transition: all 200ms ease-in-out;

  &:focus {
    outline: 0;
  }

  &:focus + ${Label} {
    color: ${({ theme }) => theme.text1};
    font-weight: 600;
    transform: scale(0.7) translate3d(21px, 36px, 0);
  }

  &:not(:placeholder-shown) + ${Label} {
    font-weight: 600;
    transform: scale(0.7) translate3d(21px, 36px, 0);
  }

  &:disabled {
    color: ${({ theme }) => theme.text2};
    border-bottom: 1px solid ${({ theme }) => theme.text2};
  }
`

export const TextArea = styled.textarea`
  ${InputCss}
  resize: none;
  min-height: 116px;
  width: 100%;
`

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;

  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* Firefox */
  input[type='number'] {
    -moz-appearance: textfield;
  }
`

const InputWrapper = styled.div`
  position: relative;
`

const Input = styled.input`
  ${InputCss}
  order: 2;

  &::placeholder {
    opacity: 0;
  }
`

const LeftComponentContainer = styled.div`
  position: absolute;
  bottom: 0;
  height: ${inputHeight}px;
  width: ${inputHeight / 1.2}px;
  border-right: 1px solid ${({ theme }) => theme.text3};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
`
