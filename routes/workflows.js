const express = require("express");
const mongoose = require("mongoose");
const Workflow = require("../models/Workflow");
const WorkflowExecution = require("../models/WorkflowExecution");
const { processJsonPath, validateJsonPath } = require("../utils/jsonPathService");

const router = express.Router();

const buildErrorResponse = (error) => {
  if (error?.name === "ValidationError") {
    const errors = Object.values(error.errors).map((err) => err.message);
    return {
      status: 400,
      body: {
        success: false,
        message: "Validation error",
        errors,
      },
    };
  }

  return {
    status: 500,
    body: {
      success: false,
      message: "Internal server error",
      error: error?.message,
    },
  };
};

const findWorkflow = async (workflowId) => {
  if (!mongoose.Types.ObjectId.isValid(workflowId)) return null;
  return Workflow.findById(workflowId);
};

const findExecution = async (workflowId, executionId) => {
  if (!mongoose.Types.ObjectId.isValid(executionId)) return null;
  return WorkflowExecution.findOne({ _id: executionId, workflowId });
};

const paginationParams = (req) => {
  const page = Math.max(parseInt(req.query.page || "1", 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || "20", 10), 1), 100);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildFilters = (query = {}) => {
  const filters = {};
  if (query.status) filters.status = query.status;
  if (query.workstream) filters.workstream = query.workstream;
  if (query.category) filters.category = query.category;
  if (query.search) {
    filters.$or = [
      { name: { $regex: query.search, $options: "i" } },
      { description: { $regex: query.search, $options: "i" } },
    ];
  }
  return filters;
};

const generateIdentifier = () => new mongoose.Types.ObjectId().toString();

const ensureWorkflowAndExecution = async ({ workflowId, executionId }) => {
  const workflow = await findWorkflow(workflowId);
  if (!workflow) {
    return { workflow: null, execution: null, response: { status: 404, body: { success: false, message: "Workflow not found" } } };
  }

  const execution = await findExecution(workflow._id, executionId);
  if (!execution) {
    return { workflow, execution: null, response: { status: 404, body: { success: false, message: "Execution not found" } } };
  }

  return { workflow, execution };
};

// ---------- Workflow CRUD ----------

router.post("/", async (req, res) => {
  try {
    const workflow = new Workflow(req.body);
    await workflow.save();
    res.status(201).json({ success: true, data: workflow });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.get("/", async (req, res) => {
  try {
    const { page, limit, skip } = paginationParams(req);
    const filters = buildFilters(req.query);
    const [data, total] = await Promise.all([
      Workflow.find(filters).sort({ updatedAt: -1 }).skip(skip).limit(limit),
      Workflow.countDocuments(filters),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- JSONPath Utilities ----------

router.post("/jsonpath/process", (req, res) => {
  try {
    const result = processJsonPath(req.body || {});
    res.json(result);
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.post("/jsonpath/validate", (req, res) => {
  try {
    if (!req.body?.expression) {
      return res.status(400).json({
        success: false,
        message: "Expression is required",
      });
    }

    const result = validateJsonPath({
      expression: req.body.expression,
      sampleData: req.body.sampleData || {},
    });
    res.json(result);
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const workflow = await findWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }
    res.json({ success: true, data: workflow });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.put("/:id", async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndUpdate(
      req.params.id,
      { $set: req.body, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    res.json({ success: true, data: workflow });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const workflow = await Workflow.findByIdAndDelete(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }
    res.json({ success: true, message: "Workflow deleted successfully" });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- Workflow Execution ----------

router.post("/:id/execute", async (req, res) => {
  try {
    const workflow = await findWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ success: false, message: "Workflow not found" });
    }

    const execution = new WorkflowExecution({
      workflowId: workflow._id,
      workflowVersion: workflow.version,
      status: "running",
      context: {
        variables: req.body.variables || {},
        data: req.body.input || {},
        userId: req.body.userId,
        triggerType: req.body.triggerType || "manual",
      },
      currentNodeIds: req.body.currentNodeIds || [],
      triggeredBy: req.body.userId,
      startedAt: new Date(),
    });

    await execution.save();
    res.status(201).json({ success: true, data: execution });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.get("/:id/executions/:executionId", async (req, res) => {
  try {
    const { workflow, execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });

    if (response) return res.status(response.status).json(response.body);

    res.json({
      success: true,
      data: {
        workflow,
        execution,
      },
    });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.post("/:id/executions/:executionId/cancel", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });

    if (response) return res.status(response.status).json(response.body);

    execution.status = "cancelled";
    execution.completedAt = new Date();
    execution.duration = execution.startedAt ? Date.now() - execution.startedAt.getTime() : undefined;
    execution.error = req.body.reason ? { message: req.body.reason } : execution.error;

    await execution.save();
    res.json({ success: true, data: execution });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- Parallel Execution ----------

router.post("/:id/executions/:executionId/nodes/:nodeId/execute-parallel", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const parallelExecutionId = req.body.parallelExecutionId || generateIdentifier();

    const parallelPayload = {
      parallelExecutionId,
      nodeId: req.params.nodeId,
      status: "running",
      startedAt: new Date(),
      branches: (req.body.branches || []).map((branch) => ({
        branchId: branch.branchId || generateIdentifier(),
        nodes: branch.nodes || [],
        status: branch.status || "running",
        startedAt: new Date(),
      })),
    };

    execution.parallelExecutions.push(parallelPayload);
    if (!execution.currentNodeIds.includes(req.params.nodeId)) {
      execution.currentNodeIds.push(req.params.nodeId);
    }
    await execution.save();

    res.status(201).json({ success: true, data: parallelPayload });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.get("/:id/executions/:executionId/parallel/:parallelExecutionId", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const parallelExecution = execution.parallelExecutions.find(
      (item) => item.parallelExecutionId === req.params.parallelExecutionId
    );

    if (!parallelExecution) {
      return res.status(404).json({ success: false, message: "Parallel execution not found" });
    }

    res.json({ success: true, data: parallelExecution });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- Map Execution ----------

router.post("/:id/executions/:executionId/nodes/:nodeId/execute-map", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const mapExecutionId = req.body.mapExecutionId || generateIdentifier();
    const payload = {
      mapExecutionId,
      nodeId: req.params.nodeId,
      status: "running",
      totalItems: Array.isArray(req.body.items) ? req.body.items.length : req.body.totalItems || 0,
      processedItems: 0,
      failedItems: 0,
      maxConcurrency: req.body.maxConcurrency,
      itemsPath: req.body.itemsPath,
      iteratorNodes: req.body.iteratorNodes || [],
      results: [],
      startedAt: new Date(),
    };

    execution.mapExecutions.push(payload);
    await execution.save();
    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.get("/:id/executions/:executionId/map/:mapExecutionId", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const mapExecution = execution.mapExecutions.find((item) => item.mapExecutionId === req.params.mapExecutionId);
    if (!mapExecution) {
      return res.status(404).json({ success: false, message: "Map execution not found" });
    }

    res.json({ success: true, data: mapExecution });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- Wait State ----------

router.post("/:id/executions/:executionId/nodes/:nodeId/wait", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const waitId = req.body.waitId || generateIdentifier();
    const waitState = {
      waitId,
      nodeId: req.params.nodeId,
      waitType: req.body.waitType,
      status: "waiting",
      seconds: req.body.seconds,
      timestamp: req.body.timestamp,
      untilExpression: req.body.untilExpression,
      resumeAt: req.body.resumeAt,
      workflowData: req.body.workflowData,
    };

    execution.waitStates.push(waitState);
    if (!execution.waitingNodeIds.includes(req.params.nodeId)) {
      execution.waitingNodeIds.push(req.params.nodeId);
    }
    execution.status = "waiting";
    await execution.save();

    res.status(201).json({ success: true, data: waitState });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.get("/:id/executions/:executionId/wait/:waitId", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const waitState = execution.waitStates.find((item) => item.waitId === req.params.waitId);
    if (!waitState) {
      return res.status(404).json({ success: false, message: "Wait state not found" });
    }

    res.json({ success: true, data: waitState });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.post("/:id/executions/:executionId/wait/:waitId/resume", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const waitState = execution.waitStates.find((item) => item.waitId === req.params.waitId);
    if (!waitState) {
      return res.status(404).json({ success: false, message: "Wait state not found" });
    }

    waitState.status = "completed";
    waitState.resumedAt = new Date();
    execution.status = "running";
    execution.waitingNodeIds = execution.waitingNodeIds.filter((id) => id !== waitState.nodeId);

    await execution.save();
    res.json({ success: true, data: waitState });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- Retry & Error Handling ----------

router.post("/:id/executions/:executionId/nodes/:nodeId/execute-with-retry", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const payload = {
      nodeId: req.params.nodeId,
      nodeType: req.body.nodeType,
      status: "running",
      attempt: 1,
      startedAt: new Date(),
      input: req.body.input,
    };

    execution.nodeExecutions.push(payload);
    await execution.save();

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.post("/:id/executions/:executionId/nodes/:nodeId/retry", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    const existingExecution = execution.nodeExecutions
      .filter((node) => node.nodeId === req.params.nodeId)
      .sort((a, b) => b.attempt - a.attempt)[0];

    const attempt = existingExecution ? existingExecution.attempt + 1 : 1;
    const payload = {
      nodeId: req.params.nodeId,
      nodeType: req.body.nodeType,
      status: "running",
      attempt,
      startedAt: new Date(),
      input: req.body.input,
      error: req.body.previousError,
    };

    execution.nodeExecutions.push(payload);
    await execution.save();

    res.status(201).json({ success: true, data: payload });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.post("/:id/executions/:executionId/nodes/:nodeId/catch-error", async (req, res) => {
  try {
    const { execution, response } = await ensureWorkflowAndExecution({
      workflowId: req.params.id,
      executionId: req.params.executionId,
    });
    if (response) return res.status(response.status).json(response.body);

    execution.error = req.body.error || { message: "Node execution failed" };
    execution.failedNodeIds = Array.from(new Set([...execution.failedNodeIds, req.params.nodeId]));

    if (req.body.nextNodeId) {
      execution.currentNodeIds = [req.body.nextNodeId];
    } else {
      execution.status = "failed";
      execution.completedAt = new Date();
    }

    await execution.save();

    res.json({
      success: true,
      data: {
        errorHandled: Boolean(req.body.nextNodeId),
        nextNodeId: req.body.nextNodeId,
        error: execution.error,
      },
    });
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

// ---------- JSONPath Utilities ----------

router.post("/jsonpath/process", (req, res) => {
  try {
    const result = processJsonPath(req.body || {});
    res.json(result);
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

router.post("/jsonpath/validate", (req, res) => {
  try {
    if (!req.body?.expression) {
      return res.status(400).json({
        success: false,
        message: "Expression is required",
      });
    }

    const result = validateJsonPath({
      expression: req.body.expression,
      sampleData: req.body.sampleData || {},
    });
    res.json(result);
  } catch (error) {
    const formatted = buildErrorResponse(error);
    res.status(formatted.status).json(formatted.body);
  }
});

module.exports = router;

