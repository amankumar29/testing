// services/apiSlice.js
import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "./baseQuery";

// API slice with endpoints
const apiSlice = createApi({
  reducerPath: "api",
  tagTypes: ["User", "Project"], // Define tags
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // Authentication endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: "/user/login",
        method: "POST",
        body: credentials,
      }),
    }),
    // User endpoints
    getUserData: builder.query({
      query: () => "/user/details",
      providesTags: ["User"],
    }),
    // User update
    updateUser: builder.mutation({
      query: (payload) => ({
        url: "/user/update",
        method: "POST",
        body: payload,
      }),
    }),

    // change password
    changePassword: builder.mutation({
      query: (payload) => ({
        url: "/user/change-password",
        method: "POST",
        body: payload,
      }),
    }),

    // get Project data
    getProjectList: builder.query({
      query: ({ sortDirection, sortColumn, search, limit, offset } = {}) => {
        return {
          url: "/project/get-all",
          method: "GET",
          params: {
            sortDirection,
            sortColumn,
            search,
            limit,
            offset,
          },
        };
      },
      providesTags: ["User"],
    }),
    // set default project and application
    setDefault: builder.mutation({
      query: (payload) => ({
        url: "/application/default",
        method: "POST",
        body: payload,
      }),
    }),

    // Add new Project end point
    createProject: builder.mutation({
      query: (payload) => ({
        url: "/project/create",
        method: "POST",
        body: payload,
      }),
    }),

    // Delete project end point
    deleteProject: builder.mutation({
      query: (payload) => ({
        url: `/project/${payload}`,
        method: "DELETE",
      }),
    }),

    // Add new application end point
    createApplication: builder.mutation({
      query: (payload) => ({
        url: "/application/create-application",
        method: "POST",
        body: payload,
      }),
    }),

    // Test Plan
    getTestPlanLists: builder.query({
      query: ({
        searchKey,
        limit,
        offset,
        projectId,
        applicationId,
        sortDirection,
        sortColumn,
      }) => {
        return {
          url: "/test-plans",
          method: "GET",
          params: {
            searchKey,
            limit,
            offset,
            projectId,
            applicationId,
            sortDirection,
            sortColumn,
          },
        };
      },
    }),

    // // Get application details by app id
    getApplicationDetailsById: builder.query({
      query: ({ id, params = {} }) => {
        const { limit, offset, sortDirection, sortColumn, searchKey } = params;

        // Build URL with only defined parameters
        const queryParams = new URLSearchParams({
          id,
          ...(limit && { limit }),
          ...(offset && { offset }),
          ...(sortDirection && { sortDirection }),
          ...(sortColumn && { sortColumn }),
          ...(searchKey && { searchKey }),
        }).toString();

        return {
          url: `/application/application-details/?${queryParams}`,
          method: "GET",
        };
      },
    }),

    // Update the project details by id
    updateProjectDetailsById: builder.mutation({
      query: ({ projectId, payload }) => {
        return {
          url: `project/${projectId}`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    // Delete a project by id
    deleteProjectById: builder.mutation({
      query: (projectId) => {
        return {
          url: `project/${projectId}`,
          method: "DELETE",
        };
      },
    }),

    // Delete an application by id
    deleteApplicationById: builder.mutation({
      query: ({ applicationToDeleteId, payload }) => {
        return {
          url: `application/delete-application/${applicationToDeleteId}`,
          method: "DELETE",
          body: payload,
        };
      },
    }),

    // Update application details by id
    updateApplicationById: builder.mutation({
      query: ({ applicationId, payload }) => ({
        url: `application/update-application/${applicationId}`, // Use applicationId in the URL
        method: "PUT", // For updating the application
        body: payload, // Send FormData as the request body
      }),
    }),

    // Upload file chunk for an application
    uploadFileChunk: builder.mutation({
      query: ({
        appId,
        chunk,
        appFile,
        totalChunks,
        currentChunk,
        isFormData = false,
      }) => {
        const formData = new FormData();
        formData.append("appFile", chunk, appFile); // The chunk of the file
        formData.append("totalChunks", totalChunks);
        formData.append("currentChunk", currentChunk);
        formData.append("isFormData", isFormData);

        return {
          url: `/application/upload/chunk/${appId}`,
          method: "POST",
          body: formData,
        };
      },
    }),

    // Remove an application file
    removeAppFile: builder.mutation({
      query: (appId) => ({
        url: `/application/delete/appFile/${appId}`,
        method: "DELETE",
      }),
    }),

    // Create Scheduler
    createScheduler: builder.mutation({
      query: (payload) => ({
        url: "/test-plans/create",
        method: "POST",
        body: payload,
      }),
    }),

    // Delete Test Plan
    deleteScheduler: builder.mutation({
      query: (payload) => ({
        url: `/test-plans/${payload}`,
        method: "DELETE",
      }),
    }),

    // get Test Plan
    getTestPlanInformation: builder.query({
      query: (planId) => {
        return {
          url: `/test-plans/${planId}`,
          method: "GET",
        };
      },
    }),

    // Scheduler Update
    updateScheduler: builder.mutation({
      query: ({ payload, id }) => ({
        url: `/test-plans/${id}`,
        method: "PATCH",
        body: payload,
      }),
    }),

    // for getting the integration
    getIntegration: builder.query({
      query: () => "/integrations",
      providesTags: ["Integration"],
    }),

    // for creating the integration
    createIntegration: builder.mutation({
      query: (payload) => ({
        url: "/integrations/create",
        method: "POST",
        body: payload,
      }),
    }),

    // Run Test Case List
    getRunsTestCaseList: builder.query({
      query: ({
        applicationId,
        projectId,
        runType,
        fromDate,
        toDate,
        search,
        limit,
        offset,
        includeCount,
        sortDirection,
        sortColumn,
      }) => {
        return {
          url: "/run",
          method: "GET",
          params: {
            applicationId,
            projectId,
            runType,
            fromDate,
            toDate,
            search,
            limit,
            offset,
            includeCount,
            sortDirection,
            sortColumn,
          },
        };
      },
    }),

    // Delete in Runs List
    deleteRunsList: builder.mutation({
      query: (payload) => ({
        url: `/run/${payload}`,
        method: "DELETE",
      }),
    }),

    // Create Run
    createTestCaseRun: builder.mutation({
      query: (payload) => ({
        url: "/run/create-test-case-run",
        method: "POST",
        body: payload,
      }),
    }),

    // Update the integration basred on Id
    updateIntegration: builder.mutation({
      query: ({ integrationId, payload }) => {
        return {
          url: `/integrations/${integrationId}`,
          method: "PATCH",
          body: payload,
        };
      },
    }),

    // Delete a integration by id
    deleteIntegration: builder.mutation({
      query: (integrationId) => {
        return {
          url: `/integrations/${integrationId}`,
          method: "DELETE",
        };
      },
    }),

    // Create Run
    createUser: builder.mutation({
      query: (payload) => ({
        url: "/user/create",
        method: "POST",
        body: payload,
      }),
    }),

    // Create Run
    createTestSuiteRun: builder.mutation({
      query: (payload) => ({
        url: "/run/create-test-suite-run",
        method: "POST",
        body: payload,
      }),
    }),

    // Delete Users
    deleteUserData: builder.mutation({
      query: (payload) => ({
        url: "/project/projectUsers",
        method: "POST",
        body: payload,
      }),
    }),

    updateUserStatusApplication: builder.mutation({
      query: (payload) => ({
        url: "/application/update-status",
        method: "PUT",
        body: payload,
      }),
    }),

    updateUserRoleApplication: builder.mutation({
      query: (payload) => ({
        url: "/application/update-userRole",
        method: "PUT",
        body: payload,
      }),
    }),

    // get Project List Info
    getProjectListInfo: builder.query({
      query: (projectId) => {
        return {
          url: `/project/info/${projectId}`,
          method: "GET",
        };
      },
    }),

    // get Application count Info

    getApplicationCountInfo: builder.mutation({
      query: (payload) => ({
        url: "/application/info",
        method: "POST",
        body: payload,
      }),
    }),

    // upload profile image
    uploadProfileImage: builder.mutation({
      query: ({ id, formData }) => {
        return {
          url: `/user/upload/${id}`,
          method: "POST",
          body: formData,
        };
      },
    }),

    // delete profile image
    deleteProfileImage: builder.mutation({
      query: (id) => {
        return {
          url: `/user/delete/${id}`,
          method: "DELETE",
        };
      },
    }),

    // email notification for assign users
    emailNotification: builder.mutation({
      query: (payload) => ({
        url: "/email/sendEmail",
        method: "POST",
        body: payload,
      }),
    }),
    // Create Global Variable
    createGlobalVariable: builder.mutation({
      query: (payload) => {
        return {
          url: "/globalVariables/create",
          method: "POST",
          body: payload,
        };
      },
    }),

    // Get Global Variable List
    getGlobalVariable: builder.query({
      query: ({ applicationId, projectId, search }) => {
        return {
          url: "/globalVariables/get",
          method: "GET",
          params: {
            applicationId,
            projectId,
            search,
          },
        };
      },
    }),

    updateGlobalVariable: builder.mutation({
      query: (payload) => {
        return {
          url: "/globalVariables/update",
          method: "PUT",
          body: payload,
        };
      },
    }),

    deleteGlobalVariable: builder.mutation({
      query: (id) => {
        return {
          url: `/globalVariables/delete?_id=${id}`,
          method: "DELETE",
        };
      },
    }),

    // More endpoints can be added here as needed
  }),
});

export default apiSlice;
