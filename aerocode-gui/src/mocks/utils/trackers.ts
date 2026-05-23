export const now = () => new Date().toISOString();

export const makeStatusTracker = (status, history = []) => {
  const data = now();
  const historico = history.length ? history : [{ status, data }];
  return {
    atual: historico[historico.length - 1],
    historico,
  };
};

export const makeResultadoTracker = (resultado) => {
  const data = now();
  return {
    atual: { resultado, data },
    historico: [{ resultado, data }],
  };
};
