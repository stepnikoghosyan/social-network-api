export function coerceBooleanParam(value: any): boolean {
  return !!value && (value === true || value === 'true' || +value === 1);
}
