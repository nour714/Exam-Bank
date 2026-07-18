import { BaseComponent } from './component.js';
import { authService } from '../services/auth.service.js';

/**
 * Base Guard Component.
 * Checks a condition, renders child if true, renders fallback (or nothing) if false.
 */
class GuardComponent extends BaseComponent {
  /**
   * @param {Object} props
   * @param {BaseComponent} props.child - Component to wrap
   * @param {BaseComponent|null} [props.fallback=null] - Component to show if denied
   */
  constructor(props) {
    super(props);
    this.child = props.child;
    this.fallback = props.fallback;
    this.isAllowed = this.checkCondition();

    if (this.isAllowed && this.child) {
      this.registerChild(this.child);
    } else if (!this.isAllowed && this.fallback) {
      this.registerChild(this.fallback);
    }
  }

  checkCondition() {
    return false; // Override in subclasses
  }

  render() {
    this.element = document.createElement('div');
    this.element.className = 'guard-wrapper';
    
    if (this.isAllowed && this.child) {
      this.element.appendChild(this.child.render());
    } else if (!this.isAllowed && this.fallback) {
      this.element.appendChild(this.fallback.render());
    }

    // Unwrap if possible to avoid unnecessary DOM layers
    if (this.element.childNodes.length === 1 && this.element.firstChild.nodeType === 1) {
      return this.element.firstChild;
    }
    
    return this.element;
  }

  mount() {
    super.mount();
    if (this.isAllowed && this.child) {
      if (typeof this.child.mount === 'function') this.child.mount();
    } else if (!this.isAllowed && this.fallback) {
      if (typeof this.fallback.mount === 'function') this.fallback.mount();
    }
  }
}

/**
 * RoleGuard
 * Renders child only if user has one of the required roles.
 */
export class RoleGuard extends GuardComponent {
  /**
   * @param {Object} props
   * @param {string[]} props.roles - Allowed roles (e.g. ['ADMIN', 'TEACHER'])
   */
  checkCondition() {
    const roles = this.props.roles || [];
    // If no roles specified, deny by default
    if (roles.length === 0) return false;
    
    return roles.some(role => authService.hasRole(role));
  }
}

/**
 * PermissionGuard
 * Renders child only if user has the specific permission.
 */
export class PermissionGuard extends GuardComponent {
  /**
   * @param {Object} props
   * @param {string} props.permission - Required permission (e.g. 'delete_exam')
   */
  checkCondition() {
    if (!this.props.permission) return false;
    // Assume authService has a hasPermission method or check the store
    // For now, fallback to hasRole if hasPermission isn't implemented
    if (typeof authService.hasPermission === 'function') {
      return authService.hasPermission(this.props.permission);
    }
    return false;
  }
}
