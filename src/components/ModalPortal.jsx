import { createPortal } from "react-dom";

/**
 * ModalPortal – renders children into document.body
 * so modals are NEVER clipped by overflow:hidden parents.
 */
export default function ModalPortal({ children }) {
  return createPortal(children, document.body);
}
