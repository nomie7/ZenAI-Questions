import { NextRequest, NextResponse } from "next/server";
import {
  saveFeedback,
  getAllFeedback,
  getFeedbackStats,
  getFeedbackByMessageId,
  type FeedbackType,
} from "@/lib/db";

/**
 * POST /api/feedback
 * Save user feedback for a message
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      messageId,
      conversationId,
      userMessage,
      assistantResponse,
      feedbackType,
      metadata,
    } = body;

    // Validate required fields
    if (!messageId) {
      return NextResponse.json(
        { error: "messageId is required" },
        { status: 400 }
      );
    }

    if (!assistantResponse) {
      return NextResponse.json(
        { error: "assistantResponse is required" },
        { status: 400 }
      );
    }

    if (!feedbackType || !["thumbs_up", "thumbs_down"].includes(feedbackType)) {
      return NextResponse.json(
        { error: "feedbackType must be 'thumbs_up' or 'thumbs_down'" },
        { status: 400 }
      );
    }

    // Check if feedback already exists for this message
    const existingFeedback = getFeedbackByMessageId(messageId);
    if (existingFeedback) {
      return NextResponse.json(
        { error: "Feedback already exists for this message", existing: existingFeedback },
        { status: 409 }
      );
    }

    // Save feedback
    const feedbackId = saveFeedback({
      message_id: messageId,
      conversation_id: conversationId,
      user_message: userMessage,
      assistant_response: assistantResponse,
      feedback_type: feedbackType as FeedbackType,
      metadata,
    });

    console.log(`[Feedback] Saved ${feedbackType} for message ${messageId}`);

    return NextResponse.json({
      success: true,
      feedbackId,
      message: `Feedback saved successfully`,
    });
  } catch (error) {
    console.error("[Feedback] Error saving feedback:", error);
    return NextResponse.json(
      { error: "Failed to save feedback" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/feedback
 * Get all feedback or stats
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = parseInt(searchParams.get("limit") || "100");
    const offset = parseInt(searchParams.get("offset") || "0");

    if (action === "stats") {
      // Return feedback statistics
      const stats = getFeedbackStats();
      return NextResponse.json(stats);
    }

    // Return all feedback records
    const feedback = getAllFeedback(limit, offset);
    return NextResponse.json({
      feedback,
      count: feedback.length,
      limit,
      offset,
    });
  } catch (error) {
    console.error("[Feedback] Error getting feedback:", error);
    return NextResponse.json(
      { error: "Failed to get feedback" },
      { status: 500 }
    );
  }
}
