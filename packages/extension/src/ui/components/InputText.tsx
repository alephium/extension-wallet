import { ComponentPropsWithRef, RefObject, useRef } from 'react'
import { Controller, ControllerProps, FieldValues } from 'react-hook-form'
import styled, { StyledComponentPropsWithRef, css } from 'styled-components'

import { isNumeric } from '../../shared/utils/number'

function randomString() {
  return Math.floor(Math.random() * 1000).toString()
}

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
          ref={inputRef}
          {...props}
        />
        <Label>{placeholder}</Label>
      </Container>
    )
  }
)``

export type InputFieldProps = Omit<React.HTMLProps<HTMLInputElement>, 'ref' | 'as'>

export const InputTextAlt = styled(
  ({
    placeholder,
    type,
    autoFocus,
    onChange,
    value,
    disabled,
    className,
    style,
    inputRef,
    children,
    ...props
  }: { inputRef: any } & InputFieldProps) => {
    const idRef = useRef(randomString())
    return (
      <Container className={className} style={style}>
        <InputAlt
          placeholder={placeholder}
          id={idRef.current}
          type={type}
          onChange={onChange}
          value={value}
          autoFocus={autoFocus}
          disabled={disabled}
          ref={inputRef}
          {...props}
        />
        {children}
      </Container>
    )
  }
)``

export const ControlledInputText = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  ...props
}: ControlledInputProps<T>) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    rules={rules}
    render={({ field: { ref, value, ...field } }) => <InputText {...props} value={value || ''} {...field} />}
  />
)

interface AdditionalControlledInputProps {
  onlyNumeric?: boolean
  children?: React.ReactNode
}

export type ControlledInputProps<T extends FieldValues> = InputFieldProps &
  Omit<ControllerProps<T>, 'render'> &
  AdditionalControlledInputProps

export const ControlledInputTextAlt = <T extends FieldValues>({
  name,
  control,
  defaultValue,
  rules,
  onlyNumeric,
  children,
  ...props
}: ControlledInputProps<T>) => (
  <Controller
    name={name}
    control={control}
    defaultValue={defaultValue}
    rules={rules}
    render={({ field: { ref, value, onChange: onValueChange, ...field } }) => (
      <InputTextAlt
        style={{ position: 'relative' }}
        {...props}
        value={value || ''}
        {...field}
        inputRef={ref}
        inputMode="decimal"
        type="text"
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
          const numericalRegex = new RegExp(/^[0-9]*.?[0-9]*$/)
          if (onlyNumeric) {
            if (e.target.value === '') {
              return onValueChange(e)
            }

            return (
              numericalRegex.test(e.target.value) &&
              // just being double sure
              isNumeric(e.target.value) &&
              onValueChange(e)
            )
          } else {
            return onValueChange(e)
          }
        }}
      >
        {children}
      </InputTextAlt>
    )}
  />
)

export type ControlledInputType = typeof ControlledInputTextAlt

export const StyledControlledInput: ControlledInputType = styled(ControlledInputTextAlt)`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.bg2};
  border-radius: 9px;
  background-color: ${({ theme }) => theme.bg1};
`

const Label = styled.label`
  color: ${({ theme }) => theme.text2};
  font-weight: normal;
  height: 20px;
  font-size: 17px;
  order: 1;
  pointer-events: none;
  text-shadow: none;
  transform-origin: left;
  transform: scale(1) translate3d(15px, 38px, 0);
  transition: all 200ms ease-in-out;
  text-align: start;
`

const InputCss = css`
  border-radius: 0;
  display: flex;
  font-size: 17px;
  line-height: 30px;
  text-shadow: none;

  background-color: ${({ theme }) => theme.bg3};
  border-radius: 9px;
  border: 0;
  color: ${({ theme }) => theme.text1};

  padding: 0 15px;
  padding-top: 22px;
  padding-bottom: 5px;

  flex: 1 1 auto;
  transition: all 200ms ease-in-out;

  &:focus {
    outline: 0;
  }

  &:focus + ${Label} {
    color: ${({ theme }) => theme.text1};
    transform: scale(0.7) translate3d(21px, 36px, 0);
  }

  &:not(:placeholder-shown) + ${Label} {
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

const InputCssAlt = css`
  border-radius: 0;
  display: flex;
  font-size: 17px;
  line-height: 25px;
  text-shadow: none;

  background-color: transparent;
  color: ${({ theme }) => theme.text1};

  border: 0;
  flex: 1 1 auto;

  &:focus {
    outline: 0;
  }

  &:disabled {
    color: ${({ theme }) => theme.text2};
  }
`

const Input = styled.input`
  ${InputCss}
  order: 2;

  &::placeholder {
    opacity: 0;
  }
`

const InputAlt = styled.input`
  ${InputCssAlt}
  order: 2;
  text-overflow: ellipsis;

  &::placeholder {
    color: ${({ theme }) => theme.text2};
  }
`
