import { CATEGORY_RULES } from '../../domain/validation.js';

/** Align transparent artwork to projected shoulders or hips; no physical fit is inferred. */
export function garmentTransform(product, pose, frame, controls = {}) {
  const slot = CATEGORY_RULES[product.category].slot;
  const lower = slot === 'lower';
  const factor = (controls.scale ?? 100) / 100;
  const offset = (controls.position ?? 160) - 160;
  const defaultTransform = {
    x: frame.x + frame.width / 2 + (controls.horizontal ?? 0),
    y: frame.y + frame.height * (lower ? .54 : .28) + offset,
    scaleX: frame.width * (lower ? .25 : .4) / (lower ? 180 : 200) * factor,
    scaleY: frame.height * (lower ? .4 : .38) / (lower ? 490 : 410) * factor,
    angle: (controls.rotation ?? 0) * Math.PI / 180,
    anchorX: 240, anchorY: lower ? 60 : 65, automatic: false
  };
  if (!pose) return defaultTransform;
  const [a, b] = lower ? [pose[23], pose[24]] : [pose[11], pose[12]];
  const next = lower ? [pose[27], pose[28]] : [pose[23], pose[24]];
  if ([a, b, ...next].some(point => !point || !Number.isFinite(point.x) || !Number.isFinite(point.y) || (point.visibility ?? 0) < .65)) return defaultTransform;
  let left = a, right = b;
  if (left.x > right.x) [left, right] = [right, left];
  const dx = (right.x - left.x) * frame.width;
  const dy = (right.y - left.y) * frame.height;
  const centerX = (left.x + right.x) / 2;
  const centerY = (left.y + right.y) / 2;
  const endX = (next[0].x + next[1].x) / 2;
  const endY = (next[0].y + next[1].y) / 2;
  const width = Math.hypot(dx, dy);
  const height = Math.hypot((endX - centerX) * frame.width, (endY - centerY) * frame.height);
  if (width < 10 || height < 10) return defaultTransform;
  return {
    ...defaultTransform,
    x: frame.x + centerX * frame.width + (controls.horizontal ?? 0),
    y: frame.y + centerY * frame.height + offset,
    scaleX: width / (lower ? 180 : 200) * factor,
    scaleY: height / (lower ? 490 : 360) * factor * (slot === 'full' ? 1.7 : 1),
    angle: Math.atan2(dy, dx) + defaultTransform.angle,
    automatic: true
  };
}
