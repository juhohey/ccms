export const getId = () => (Math.random() + 1).toString(16).substr(-10).replace(/\./g, '-').replace(/\//g, '_').replace(/=/g, '')
