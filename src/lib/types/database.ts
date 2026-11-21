/**
 * Database types, hand-written in the same shape the Supabase CLI generates.
 * Keep in sync with supabase/schema.sql. You can later replace this file with:
 *   npx supabase gen types typescript --project-id <id> > src/lib/types/database.ts
 * (then re-add the convenience aliases at the bottom).
 */

export type PaymentMethod = "cod" | "payhere";
export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus = "new" | "bought" | "shipped" | "delivered" | "cancelled";

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          in_stock: boolean;
          is_visible: boolean;
          images: string[];
          category_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string;
          price: number;
          in_stock?: boolean;
          is_visible?: boolean;
          images?: string[];
          category_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string;
          price?: number;
          in_stock?: boolean;
          is_visible?: boolean;
          images?: string[];
          category_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_private: {
        Row: {
          product_id: string;
          supplier_price: number | null;
          supplier_url: string | null;
        };
        Insert: {
          product_id: string;
          supplier_price?: number | null;
          supplier_url?: string | null;
        };
        Update: {
          product_id?: string;
          supplier_price?: number | null;
          supplier_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "product_private_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: true;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      orders: {
        Row: {
          id: string;
          order_no: number;
          customer_name: string;
          phone: string;
          address: string;
          city: string;
          notes: string | null;
          subtotal: number;
          delivery_fee: number;
          total: number;
          payment_method: PaymentMethod;
          payment_status: PaymentStatus;
          status: OrderStatus;
          tracking_no: string | null;
          public_token: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_no?: number;
          customer_name: string;
          phone: string;
          address: string;
          city: string;
          notes?: string | null;
          subtotal: number;
          delivery_fee?: number;
          total: number;
          payment_method: PaymentMethod;
          payment_status?: PaymentStatus;
          status?: OrderStatus;
          tracking_no?: string | null;
          public_token?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_no?: number;
          customer_name?: string;
          phone?: string;
          address?: string;
          city?: string;
          notes?: string | null;
          subtotal?: number;
          delivery_fee?: number;
          total?: number;
          payment_method?: PaymentMethod;
          payment_status?: PaymentStatus;
          status?: OrderStatus;
          tracking_no?: string | null;
          public_token?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          product_name: string;
          qty: number;
          price: number;
          supplier_price: number | null;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          product_name: string;
          qty: number;
          price: number;
          supplier_price?: number | null;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          product_name?: string;
          qty?: number;
          price?: number;
          supplier_price?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey";
            columns: ["order_id"];
            isOneToOne: false;
            referencedRelation: "orders";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "order_items_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      settings: {
        Row: {
          id: number;
          delivery_fee: number;
          shop_phone: string | null;
          whatsapp_number: string | null;
        };
        Insert: {
          id?: number;
          delivery_fee?: number;
          shop_phone?: string | null;
          whatsapp_number?: string | null;
        };
        Update: {
          id?: number;
          delivery_fee?: number;
          shop_phone?: string | null;
          whatsapp_number?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: { user_id: string };
        Insert: { user_id: string };
        Update: { user_id?: string };
        Relationships: [];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_admin: { Args: never; Returns: boolean };
    };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// ---------------------------------------------------------------------------
// Convenience aliases
// ---------------------------------------------------------------------------

type PublicTables = Database["public"]["Tables"];

export type Tables<T extends keyof PublicTables> = PublicTables[T]["Row"];
export type TablesInsert<T extends keyof PublicTables> = PublicTables[T]["Insert"];
export type TablesUpdate<T extends keyof PublicTables> = PublicTables[T]["Update"];

export type Category = Tables<"categories">;
export type Product = Tables<"products">;
export type ProductPrivate = Tables<"product_private">;
export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;
export type Settings = Tables<"settings">;

/** Product joined with its admin-only supplier info (admin pages only). */
export type ProductWithPrivate = Product & {
  product_private: ProductPrivate | null;
};

export type OrderWithItems = Order & { order_items: OrderItem[] };
