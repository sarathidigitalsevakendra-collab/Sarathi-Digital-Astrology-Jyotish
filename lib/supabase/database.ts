import { createClient } from "./client";
import type { RealtimeChannel } from "@supabase/supabase-js";
// import type { Database } from './types'

/**
 * Generic database query helpers
 */
export const supabaseDB = {
  /**
   * Select data from a table
   */
  async select(
    table: string,
    options?: {
      columns?: string;
      filter?: Record<string, unknown>;
      order?: { column: string; ascending?: boolean };
      limit?: number;
    },
  ) {
    const supabase = createClient();
    let query = supabase.from(table).select(options?.columns || "*");

    // Apply filters
    if (options?.filter) {
      Object.entries(options.filter).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
    }

    // Apply ordering
    if (options?.order) {
      query = query.order(options.order.column, {
        ascending: options.order.ascending ?? true,
      });
    }

    // Apply limit
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    return await query;
  },

  /**
   * Insert data into a table
   */
  async insert(table: string, data: Record<string, unknown> | Record<string, unknown>[]) {
    const supabase = createClient();
    return await supabase.from(table).insert(data).select();
  },

  /**
   * Update data in a table
   */
  async update(table: string, data: Record<string, unknown>, filter: Record<string, unknown>) {
    const supabase = createClient();
    let query = supabase.from(table).update(data);

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return await query.select();
  },

  /**
   * Delete data from a table
   */
  async delete(table: string, filter: Record<string, unknown>) {
    const supabase = createClient();
    let query = supabase.from(table).delete();

    // Apply filters
    Object.entries(filter).forEach(([key, value]) => {
      query = query.eq(key, value);
    });

    return await query;
  },

  /**
   * Upsert data (insert or update if exists)
   */
  async upsert(
    table: string,
    data: Record<string, unknown> | Record<string, unknown>[],
    options?: { onConflict?: string },
  ) {
    const supabase = createClient();
    return await supabase.from(table).upsert(data, options).select();
  },

  /**
   * Get a single row by ID
   */
  async getById(table: string, id: string, idColumn: string = "id") {
    const supabase = createClient();
    return await supabase.from(table).select("*").eq(idColumn, id).single();
  },
};

/**
 * Real-time subscription helpers
 */
export const supabaseRealtime = {
  /**
   * Subscribe to table changes
   */
  subscribeToTable(
    table: string,
    callback: (payload: unknown) => void,
    options?: {
      event?: "INSERT" | "UPDATE" | "DELETE" | "*";
      filter?: string;
    },
  ): RealtimeChannel {
    const supabase = createClient();

    const channel = supabase
      .channel(`${table}-changes`)
      // TODO: Fix Supabase type definitions - postgres_changes should be properly typed
      .on(
        "postgres_changes" as any,
        {
          event: options?.event || "*",
          schema: "public",
          table,
          filter: options?.filter,
        } as any,
        callback as any,
      )
      .subscribe();

    return channel;
  },

  /**
   * Unsubscribe from a channel
   */
  async unsubscribe(channel: RealtimeChannel) {
    const supabase = createClient();
    return await supabase.removeChannel(channel);
  },
};

/**
 * Storage helpers
 */
export const supabaseStorage = {
  /**
   * Upload a file
   */
  async upload(bucket: string, path: string, file: File) {
    const supabase = createClient();
    return await supabase.storage.from(bucket).upload(path, file);
  },

  /**
   * Download a file
   */
  async download(bucket: string, path: string) {
    const supabase = createClient();
    return await supabase.storage.from(bucket).download(path);
  },

  /**
   * Get public URL for a file
   */
  getPublicUrl(bucket: string, path: string) {
    const supabase = createClient();
    return supabase.storage.from(bucket).getPublicUrl(path);
  },

  /**
   * Delete a file
   */
  async deleteFile(bucket: string, paths: string[]) {
    const supabase = createClient();
    return await supabase.storage.from(bucket).remove(paths);
  },

  /**
   * List files in a bucket
   */
  async list(bucket: string, path?: string) {
    const supabase = createClient();
    return await supabase.storage.from(bucket).list(path);
  },
};
