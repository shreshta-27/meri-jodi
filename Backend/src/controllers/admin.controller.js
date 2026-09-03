import adminService from "../services/admin.service.js"
import ApiResponse from "../utils/ApiResponse.js"

class AdminController {
    /**
     * GET /api/v1/admin/stats
     */
    async getStats(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const data = await adminService.getDashboardStats()
            return apiResponse.success(data, "Admin statistics retrieved successfully")
        } catch (error) {
            console.error("Admin getStats error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    /**
     * GET /api/v1/admin/users
     */
    async getUsers(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const data = await adminService.getUsers(req.query)
            return apiResponse.success(data, "Users retrieved successfully")
        } catch (error) {
            console.error("Admin getUsers error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    /**
     * GET /api/v1/admin/users/:id
     */
    async getUserById(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const data = await adminService.getUserById(req.params.id)
            return apiResponse.success(data, "User details retrieved successfully")
        } catch (error) {
            console.error("Admin getUserById error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    /**
     * PUT /api/v1/admin/users/:id/status
     */
    async updateUserStatus(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { status } = req.body
            if (!status) {
                return apiResponse.error("Status is required", 400)
            }
            const data = await adminService.updateUserStatus(req.params.id, status)
            return apiResponse.success(data, `User status updated to ${status}`)
        } catch (error) {
            console.error("Admin updateUserStatus error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    /**
     * PUT /api/v1/admin/users/:id/role
     */
    async updateUserRole(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { role } = req.body
            if (!role) {
                return apiResponse.error("Role is required", 400)
            }
            const data = await adminService.updateUserRole(req.params.id, role)
            return apiResponse.success(data, `User role updated to ${role}`)
        } catch (error) {
            console.error("Admin updateUserRole error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    /**
     * PUT /api/v1/admin/users/:id/verify
     */
    async toggleVerification(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const { isVerified } = req.body
            const data = await adminService.toggleUserVerification(req.params.id, isVerified)
            return apiResponse.success(data, `User verification updated to ${Boolean(isVerified)}`)
        } catch (error) {
            console.error("Admin toggleVerification error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }

    /**
     * DELETE /api/v1/admin/users/:id
     */
    async deleteUser(req, res) {
        const apiResponse = new ApiResponse(res)
        try {
            const data = await adminService.deleteUser(req.params.id)
            return apiResponse.success(data, "User deleted successfully")
        } catch (error) {
            console.error("Admin deleteUser error:", error)
            return apiResponse.error(error.message, error.statusCode || 500)
        }
    }
}

export default new AdminController()
