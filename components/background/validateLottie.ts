/** Keep uploaded and manually selected animations within the mobile budget. */
export function validateLottie(
  value: unknown,
): asserts value is Record<string, unknown> {
  if (!value || typeof value !== "object") throw Error("Lottie inválido.");
  const data = value as Record<string, unknown>;
  if (
    !data.v ||
    !Array.isArray(data.layers) ||
    typeof data.fr !== "number" ||
    data.fr <= 0 ||
    data.fr > 60
  )
    throw Error("Lottie inválido: usá hasta 60 fps.");
  let layers = 0;
  let nodes = 0;
  function visit(node: unknown) {
    if (!node || typeof node !== "object") return;
    if (++nodes > 20000) throw Error("Lottie demasiado complejo.");
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    const object = node as Record<string, unknown>;
    if (
      typeof object.x === "string" ||
      typeof object.p === "string" ||
      (typeof object.u === "string" && object.u !== "")
    )
      throw Error(
        "Usá Lottie vectorial, sin expresiones ni archivos externos.",
      );
    if (Array.isArray(object.layers)) {
      layers += object.layers.length;
      if (layers > 60) throw Error("Usá hasta 60 capas.");
    }
    Object.values(object).forEach(visit);
  }
  visit(data);
}
