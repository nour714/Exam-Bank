const permissionLayer = require('./permissions');
// In the future: const ivm = require('isolated-vm'); or const { Worker } = require('worker_threads');

/**
 * Secure Plugin Sandbox Runtime.
 * 
 * Ensures plugins cannot access Node.js built-ins (fs, net, child_process),
 * global variables, process.env, or the database directly.
 */
class PluginSandbox {
  /**
   * Execute a plugin hook securely.
   * @param {Object} plugin - { id, manifest, sourceCode }
   * @param {Object} tenantConfig - Tenant specific config
   * @param {string} hookName - The lifecycle hook to execute (e.g., 'onExamSubmitted')
   * @param {Object} payload - Data passed to the hook
   * @returns {Promise<any>}
   */
  async executeHook(plugin, tenantConfig, hookName, payload) {
    // Stage 1: Verify the plugin manifest actually declares this hook
    if (!plugin.manifest?.hooks?.includes(hookName)) {
      return null; // Plugin doesn't listen to this hook
    }

    // Stage 2: Create a secure context / SDK
    const sdk = this._buildSecureSDK(plugin.manifest, tenantConfig);

    // Stage 3: Sandbox Execution
    // TODO: Replace with `isolated-vm` or `worker_threads` for true V8 isolate isolation.
    // For now, we simulate isolation by wrapping the execution in a scoped function 
    // that masks global objects.
    
    try {
      // DANGEROUS IN PROD: eval/Function without isolated-vm is not truly secure.
      // This is an architectural placeholder for the Sandbox layer.
      const sandboxFn = new Function('exambank', 'payload', `
        // Mask Node.js globals
        const process = undefined;
        const require = undefined;
        const global = undefined;
        const __dirname = undefined;
        const __filename = undefined;
        
        ${plugin.sourceCode}
        
        if (typeof module !== 'undefined' && module.exports && module.exports.${hookName}) {
          return module.exports.${hookName}(payload, exambank);
        }
        return null;
      `);

      return await sandboxFn(sdk, payload);

    } catch (error) {
      console.error(`[Plugin Runtime] Error executing ${plugin.id} hook ${hookName}:`, error);
      throw new Error(`Plugin execution failed: ${error.message}`);
    }
  }

  /**
   * Builds the strictly controlled SDK injected into the plugin.
   * Every SDK call routes through the Permission Layer.
   */
  _buildSecureSDK(manifest, tenantConfig) {
    return {
      // Configuration
      config: {
        get: (key) => tenantConfig?.[key],
      },
      
      // Data Access APIs (Masked behind permissions)
      exams: {
        getById: async (examId) => {
          permissionLayer.enforce(manifest, 'exams', 'read');
          // Dispatch to core ExamService...
          return { id: examId, status: 'mocked_from_sdk' };
        },
      },
      
      users: {
        getProfile: async (userId) => {
          permissionLayer.enforce(manifest, 'users', 'read');
          // Dispatch to core UserService...
          return { id: userId, mocked: true };
        }
      },

      // Allowed Utilities
      utils: {
        log: (message) => {
          // Log securely to a tenant-specific plugin log stream, NOT stdout
          console.log(`[Plugin Log] ${message}`);
        }
      }
    };
  }
}

module.exports = new PluginSandbox();
