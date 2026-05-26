// useLocalStorage — hook for persistent state
function useLocalStorage(key, initial) {
  const [v, setV] = React.useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return typeof initial === 'function' ? initial() : initial;
      return JSON.parse(raw);
    } catch { return typeof initial === 'function' ? initial() : initial; }
  });
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(v)); } catch {}
  }, [key, v]);
  return [v, setV];
}
Object.assign(window, { useLocalStorage });
