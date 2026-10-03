/** All public inputs are validated before they reach the size engine or session catalog. */
export const PROFILE_RANGES = {
  height: [100, 230], chest: [40, 200], waist: [35, 200], hips: [40, 220],
  shoulders: [15, 80], arm: [20, 110], leg: [30, 140], weight: [20, 300]
};
export const MEASUREMENT_NAMES = {
  height: 'Altura', chest: 'Peito / tórax', waist: 'Cintura', hips: 'Quadril',
  shoulders: 'Ombros', arm: 'Braço', leg: 'Perna', weight: 'Peso', length: 'Comprimento'
};
export const CATEGORY_RULES = {
  top: { name: 'Camiseta / camisa / moletom', dimensions: { chest: 1 }, slot: 'upper', asset: 'tech' },
  outerwear: { name: 'Jaqueta', dimensions: { chest: 1 }, slot: 'outer', asset: 'vision' },
  bottom: { name: 'Calça / bermuda', dimensions: { waist: 2, hips: 1 }, slot: 'lower', asset: 'cargo' },
  dress: { name: 'Vestido', dimensions: { chest: 1, waist: 1, hips: 1 }, slot: 'full', asset: 'dress' },
  skirt: { name: 'Saia', dimensions: { waist: 2, hips: 1 }, slot: 'lower', asset: 'skirt' }
};
export const FIT_NAMES = { fitted: 'Justo', regular: 'Regular', loose: 'Solto', oversized: 'Oversized' };

export function validateProfile(profile) {
  if (!profile || typeof profile !== 'object' || Array.isArray(profile)) throw new Error('Informe as medidas corporais.');
  for (const [key, [min, max]] of Object.entries(PROFILE_RANGES)) {
    const value = profile[key];
    if (['height', 'chest', 'waist', 'hips'].includes(key) || value !== undefined) {
      if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
        throw new Error(`${MEASUREMENT_NAMES[key]}: informe um valor entre ${min} e ${max} ${key === 'weight' ? 'kg' : 'cm'}.`);
      }
    }
  }
  return profile;
}

export function validateProduct(product) {
  if (!product || typeof product !== 'object') throw new Error('Produto inválido.');
  if (typeof product.id !== 'string' || !/^[a-zA-Z0-9_-]{1,64}$/.test(product.id)) throw new Error('Código de produto inválido.');
  if (typeof product.name !== 'string' || product.name.trim().length < 2 || product.name.length > 80) throw new Error('Nome deve ter entre 2 e 80 caracteres.');
  if (typeof product.description !== 'string' || product.description.length > 500) throw new Error('Descrição inválida (máximo 500 caracteres).');
  if (!Object.hasOwn(CATEGORY_RULES, product.category)) throw new Error('Categoria inválida.');
  if (!Number.isFinite(product.price) || product.price < 0 || product.price > 100000) throw new Error('Preço inválido.');
  if (!Object.hasOwn(FIT_NAMES, product.defaultFit)) throw new Error('Caimento inválido.');
  if (typeof product.color !== 'string' || !/^#[0-9a-fA-F]{6}$/.test(product.color)) throw new Error('Cor inválida.');
  if (product.image && !/^\/public\/garments\/[a-z]+\.png$/.test(product.image) && !/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(product.image)) throw new Error('Use uma imagem PNG local.');
  if (product.image?.length > 3000000) throw new Error('Imagem de roupa muito grande.');
  if (!Array.isArray(product.variants) || !product.variants.length || product.variants.length > 12) throw new Error('Cadastre de 1 a 12 tamanhos.');
  const seen = new Set();
  for (const variant of product.variants) {
    if (typeof variant.size !== 'string' || !/^[a-zA-Z0-9 /-]{1,12}$/.test(variant.size) || seen.has(variant.size)) throw new Error('Tamanhos devem ter códigos válidos e únicos.');
    seen.add(variant.size);
    for (const dimension of Object.keys(CATEGORY_RULES[product.category].dimensions)) {
      if (!Number.isFinite(variant[dimension]) || variant[dimension] < 10 || variant[dimension] > 350) throw new Error(`Tabela: ${MEASUREMENT_NAMES[dimension]} inválido em ${variant.size}.`);
    }
    if (!Number.isFinite(variant.length) || variant.length < 10 || variant.length > 220) throw new Error(`Comprimento inválido em ${variant.size}.`);
  }
  return product;
}
