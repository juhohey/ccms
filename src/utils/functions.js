export const pass = a => a
export const getFieldUpdater = onUpdate => (field, isEvent) => e => onUpdate(
  { field, value: isEvent ? e.target.value : e }
)
