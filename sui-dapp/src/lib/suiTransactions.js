import { Transaction } from '@mysten/sui/transactions'
import { CONTRACTS } from '@/config/contracts'

/**
 * Register a new username on-chain
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} username - Desired username
 * @returns {Promise<Object>} Transaction result
 */
export const registerUsername = async (signAndExecute, username) => {
  const tx = new Transaction()

  // Set reasonable gas budget (0.05 SUI = 50,000,000 MIST)
  tx.setGasBudget(50000000)

  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::username::register_username`,
    arguments: [
      tx.object(CONTRACTS.USERNAME_REGISTRY),
      tx.pure.string(username),
    ],
  })

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: result => {
          resolve(result)
        },
        onError: error => {
          reject(error)
        },
      }
    )
  })
}

/**
 * Create a new project NFT
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {Object} project - Project data (type, title, description, proofLink)
 * @returns {Promise<Object>} Transaction result
 */
export const createProject = async (signAndExecute, project) => {
  const tx = new Transaction()

  // Set gas budget
  tx.setGasBudget(50000000)

  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::contribution::create_project`,
    arguments: [
      tx.object(CONTRACTS.PROJECT_REGISTRY),
      tx.pure.string(project.type),
      tx.pure.string(project.title),
      tx.pure.string(project.description),
      tx.pure.string(project.proofLink),
    ],
  })

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: result => {
          resolve(result)
        },
        onError: error => {
          reject(error)
        },
      }
    )
  })
}

/**
 * Backward compatibility alias for createProject
 * @deprecated Use createProject instead
 */
export const mintContribution = createProject

/**
 * Endorse a project
 * @param {Object} signAndExecute - Function from useSignAndExecuteTransactionBlock
 * @param {string} projectId - ID of project to endorse
 * @param {string} projectOwner - Owner address of the project
 * @returns {Promise<Object>} Transaction result
 */
export const endorseProject = async (
  signAndExecute,
  projectId,
  projectOwner
) => {
  const tx = new Transaction()

  // Set gas budget
  tx.setGasBudget(30000000)

  tx.moveCall({
    target: `${CONTRACTS.PACKAGE_ID}::contribution::endorse_project`,
    arguments: [
      tx.object(CONTRACTS.PROJECT_REGISTRY),
      tx.pure.id(projectId),
      tx.pure.address(projectOwner),
    ],
  })

  return new Promise((resolve, reject) => {
    signAndExecute(
      { transaction: tx },
      {
        onSuccess: result => {
          resolve(result)
        },
        onError: error => {
          reject(error)
        },
      }
    )
  })
}

/**
 * Backward compatibility alias for endorseProject
 * @deprecated Use endorseProject instead
 */
export const endorseContribution = endorseProject

/**
 * Query user projects from owned objects
 * @param {Object} client - Sui client instance
 * @param {string} address - User address
 * @returns {Promise<Array>} List of projects
 */
export const getUserProjects = async (client, address) => {
  try {
    const objects = await client.getOwnedObjects({
      owner: address,
      filter: {
        StructType: `${CONTRACTS.PACKAGE_ID}::contribution::Project`,
      },
      options: {
        showContent: true,
        showType: true,
      },
    })

    return objects.data
      .filter(obj => obj.data?.content)
      .map(obj => parseProject(obj.data))
  } catch (error) {
    console.error('Error fetching projects:', error)
    return []
  }
}

/**
 * Backward compatibility alias
 * @deprecated Use getUserProjects instead
 */
export const getUserContributions = getUserProjects

/**
 * Parse project object from blockchain
 * @param {Object} data - Raw object data from Sui
 * @returns {Object} Parsed project
 */
const parseProject = data => {
  const fields = data.content?.fields || {}

  return {
    id: data.objectId,
    owner: fields.owner,
    type: fields.project_type || fields.contribution_type, // Support both old and new names
    title: fields.title,
    description: fields.description,
    proofLink: fields.proof_link,
    endorsements: parseInt(
      fields.endorsement_count || fields.endorsements || '0'
    ),
    createdAt: parseInt(fields.created_at || '0'),
  }
}

/**
 * Get endorsement count for a project from registry
 * @param {Object} client - Sui client instance
 * @param {string} projectId - ID of the project
 * @returns {Promise<number>} Endorsement count
 */
export const getEndorsementCount = async (client, projectId) => {
  try {
    const registry = await client.getObject({
      id: CONTRACTS.PROJECT_REGISTRY,
      options: { showContent: true },
    })

    const endorsementCounts = registry.data?.content?.fields?.endorsement_counts

    if (!endorsementCounts) return 0

    // Query dynamic field for this project ID
    const dynamicField = await client.getDynamicFieldObject({
      parentId: CONTRACTS.PROJECT_REGISTRY,
      name: {
        type: '0x2::object::ID',
        value: projectId,
      },
    })

    return parseInt(dynamicField.data?.content?.fields?.value || '0')
  } catch (error) {
    console.error('Error fetching endorsement count:', error)
    return 0
  }
}

/**
 * Get registry statistics
 * @param {Object} client - Sui client instance
 * @returns {Promise<Object>} Registry stats
 */
export const getRegistryStats = async client => {
  try {
    const registry = await client.getObject({
      id: CONTRACTS.PROJECT_REGISTRY,
      options: { showContent: true },
    })

    const fields = registry.data?.content?.fields || {}

    return {
      totalProjects: parseInt(
        fields.total_projects || fields.total_contributions || '0'
      ),
      totalEndorsements: parseInt(fields.total_endorsements || '0'),
    }
  } catch (error) {
    console.error('Error fetching registry stats:', error)
    return {
      totalProjects: 0,
      totalEndorsements: 0,
    }
  }
}

/**
 * Check if username is available on-chain
 * @param {Object} client - Sui client instance
 * @param {string} username - Username to check
 * @returns {Promise<boolean>} True if available, false if taken
 */
export const isUsernameAvailableOnChain = async (client, username) => {
  try {
    // Get the UsernameRegistry object
    const registry = await client.getObject({
      id: CONTRACTS.USERNAME_REGISTRY,
      options: { showContent: true },
    })

    if (!registry?.data?.content?.fields?.usernames) {
      console.warn('Registry not found or empty, username available')
      return true
    }

    // Check if username exists in the table
    // Table is stored as dynamic fields
    const tableId = registry.data.content.fields.usernames.fields.id.id

    try {
      // Try to get the dynamic field for this username
      const dynamicField = await client.getDynamicFieldObject({
        parentId: tableId,
        name: {
          type: '0x1::string::String',
          value: username,
        },
      })

      // If we got a result, username is taken
      return dynamicField.error !== undefined
    } catch {
      // If error (not found), username is available
      return true
    }
  } catch (error) {
    console.error('Error checking username on-chain:', error)
    // On error, assume available to not block users
    return true
  }
}
