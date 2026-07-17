/**
 * Plugin Permission Layer.
 * Evaluates whether a plugin is authorized to perform a specific action
 * based on its manifest.
 */
class PermissionLayer {
  /**
   * Verify if a plugin has the requested permission.
   * @param {Object} manifest - The plugin's parsed manifest (JSON)
   * @param {string} resource - The resource being accessed (e.g., 'exams', 'users', 'network')
   * @param {string} action - The action requested (e.g., 'read', 'write', 'execute')
   * @returns {boolean}
   */
  hasPermission(manifest, resource, action) {
    const permissions = manifest?.permissions || [];
    
    // Check for explicit grant, e.g., "exams:read"
    const requested = `${resource}:${action}`;
    if (permissions.includes(requested)) return true;

    // Check for wildcard grant, e.g., "exams:*"
    const wildcard = `${resource}:*`;
    if (permissions.includes(wildcard)) return true;

    // Global wildcard (highly discouraged, but possible for internal plugins)
    if (permissions.includes('*:*')) return true;

    return false;
  }

  /**
   * Enforce permission, throwing an error if denied.
   */
  enforce(manifest, resource, action) {
    if (!this.hasPermission(manifest, resource, action)) {
      throw new Error(`Permission Denied: Plugin requires '${resource}:${action}'`);
    }
  }
}

module.exports = new PermissionLayer();
