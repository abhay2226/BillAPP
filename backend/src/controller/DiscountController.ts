import type { Request, Response } from "express"; 
import { verifyToken } from "../utils/jwt.js"; 
 
import { 
  createDiscountService, 
  getActiveDiscountsForStoreService, 
  getDiscountByIdService, 
  getDiscountByNameForStore, 
  updateDiscountService, 
  setDiscountActiveService, 
} from "../services/DiscountServices.js"; 
 
// ============================================================ 
// AUTH USER 
// ============================================================ 
 
function getAuthUser(req: Request) { 
  const authorization = req.headers.authorization; 
 
  if (!authorization) { 
    const error: any = new Error( 
      "Unauthorized: missing authorization header." 
    ); 
 
    error.status = 401; 
    throw error; 
  } 
 
  const token = authorization.split(" ")[1]; 
 
  if (!token) { 
    const error: any = new Error( 
      "Unauthorized: missing token." 
    ); 
 
    error.status = 401; 
    throw error; 
  } 
 
  const user = verifyToken(token); 
 
  if (!user) { 
    const error: any = new Error( 
      "Unauthorized: invalid token." 
    ); 
 
    error.status = 401; 
    throw error; 
  } 
 
  return user as { 
    userId: number; 
    roleId: number; 
    storeId: number; 
  }; 
} 
 
// ============================================================ 
// CREATE DISCOUNT 
// ============================================================ 
 
export async function createDiscountController( 
  req: Request, 
  res: Response 
) { 
  try { 
    const authUser = getAuthUser(req); 
 
    const userId = Number(authUser.userId); 
    const storeId = Number(authUser.storeId); 
 
    if (!userId) { 
      return res.status(401).json({ 
        success: false, 
        message: "Authenticated user ID is missing.", 
      }); 
    } 
 
    if (!storeId) { 
      return res.status(400).json({ 
        success: false, 
        message: 
          "Store ID is missing from the authenticated user.", 
      }); 
    } 
 
    // IMPORTANT: 
    // store_id comes from authenticated user. 
    // Do NOT trust store_id from frontend. 
    const discountData = { 
      ...req.body, 
      store_id: storeId, 
    }; 
 
    console.log("CREATE DISCOUNT"); 
    console.log("User ID:", userId); 
    console.log("Store ID:", storeId); 
    console.log("Request body:", req.body); 
    console.log("Final discount data:", discountData); 
 
    const discount = 
      await createDiscountService( 
        discountData, 
        userId 
      ); 
 
    return res.status(201).json({ 
      success: true, 
      message: "Discount created.", 
      data: discount, 
    }); 
  } catch (error) { 
    console.error( 
      "Create discount error:", 
      error 
    ); 
 
    const status = 
      (error as any)?.status ?? 400; 
 
    return res.status(status).json({ 
      success: false, 
      message: 
        error instanceof Error 
          ? error.message 
          : "Failed to create discount.", 
    }); 
  } 
} 
 
// ============================================================ 
// GET ACTIVE DISCOUNTS 
// ============================================================ 
 
export async function getActiveDiscountsController( 
  req: Request, 
  res: Response 
) { 
  try { 
    const authUser = getAuthUser(req); 
 
    const storeId = Number( 
      authUser.storeId 
    ); 
 
    if (!storeId) { 
      return res.status(400).json({ 
        success: false, 
        message: 
          "Store ID is missing from the authenticated user.", 
      }); 
    } 
 
    const discounts = 
      await getActiveDiscountsForStoreService( 
        storeId 
      ); 
 
    return res.status(200).json({ 
      success: true, 
      data: discounts, 
    }); 
  } catch (error) { 
    console.error( 
      "Get active discounts error:", 
      error 
    ); 
 
    const status = 
      (error as any)?.status ?? 400; 
 
    return res.status(status).json({ 
      success: false, 
      message: 
        error instanceof Error 
          ? error.message 
          : "Failed to fetch discounts.", 
    }); 
  } 
} 
 
// ============================================================ 
// GET DISCOUNT BY ID 
// ============================================================ 
 
export async function getDiscountByIdController( 
  req: Request, 
  res: Response 
) { 
  try { 
    getAuthUser(req); 
 
    const discountId = Number( 
      req.params.id 
    ); 
 
    if (!discountId) { 
      return res.status(400).json({ 
        success: false, 
        message: "Invalid discount ID.", 
      }); 
    } 
 
    const discount = 
      await getDiscountByIdService( 
        discountId 
      ); 
 
    return res.status(200).json({ 
      success: true, 
      data: discount, 
    }); 
  } catch (error) { 
    console.error( 
      "Get discount error:", 
      error 
    ); 
 
    const status = 
      (error as any)?.status ?? 404; 
 
    return res.status(status).json({ 
      success: false, 
      message: 
        error instanceof Error 
          ? error.message 
          : "Failed to fetch discount.", 
    }); 
  } 
} 
 
// ============================================================ 
// GET DISCOUNT BY NAME 
// ============================================================ 
 
export async function getDiscountByNameController( 
  req: Request, 
  res: Response 
) { 
  try { 
    const authUser = getAuthUser(); 
 
    const storeId = Number( 
      authUser.storeId 
    ); 
 
    const name = String( 
      req.query.name ?? "" 
    ); 
 
    if (!storeId) { 
      return res.status(400).json({ 
        success: false, 
        message: 
          "Store ID is missing from the authenticated user.", 
      }); 
    } 
 
    if (!name.trim()) { 
      return res.status(400).json({ 
        success: false, 
        message: "Discount name is required.", 
      }); 
    } 
 
    const discount = 
      await getDiscountByNameForStore( 
        name, 
        storeId 
      ); 
 
    return res.status(200).json({ 
      success: true, 
      data: discount, 
    }); 
  } catch (error) { 
    console.error( 
      "Get discount by name error:", 
      error 
    ); 
 
    const status = 
      (error as any)?.status ?? 404; 
 
    return res.status(status).json({ 
      success: false, 
      message: 
        error instanceof Error 
          ? error.message 
          : "Failed to fetch discount.", 
    }); 
  } 
} 
 
// ============================================================ 
// UPDATE DISCOUNT 
// ============================================================ 
 
export async function updateDiscountController( 
  req: Request, 
  res: Response 
) { 
  try { 
    const authUser = getAuthUser(); 
 
    const userId = Number( 
      authUser.userId 
    ); 
 
    const discountId = Number( 
      req.params.id 
    ); 
 
    if (!discountId) { 
      return res.status(400).json({ 
        success: false, 
        message: "Invalid discount ID.", 
      }); 
    } 
 
    const discount = 
      await updateDiscountService( 
        discountId, 
        req.body, 
        userId 
      ); 
 
    return res.status(200).json({ 
      success: true, 
      message: "Discount updated.", 
      data: discount, 
    }); 
  } catch (error) { 
    console.error( 
      "Update discount error:", 
      error 
    ); 
 
    const status = 
      (error as any)?.status ?? 400; 
 
    return res.status(status).json({ 
      success: false, 
      message: 
        error instanceof Error 
          ? error.message 
          : "Failed to update discount.", 
    }); 
  } 
} 
 
// ============================================================ 
// ACTIVATE / DEACTIVATE DISCOUNT 
// ============================================================ 
 
export async function setDiscountActiveController( 
  req: Request, 
  res: Response 
) { 
  try { 
    const authUser = getAuthUser(); 
 
    const userId = Number( 
      authUser.userId 
    ); 
 
    const discountId = Number( 
      req.params.id 
    ); 
 
    if (!discountId) { 
      return res.status(400).json({ 
        success: false, 
        message: "Invalid discount ID.", 
      }); 
    } 
 
    if ( 
      typeof req.body.is_active !== 
      "boolean" 
    ) { 
      return res.status(400).json({ 
        success: false, 
        message: 
          "is_active must be true or false.", 
      }); 
    } 
 
    const discount = 
      await setDiscountActiveService( 
        discountId, 
        req.body.is_active, 
        userId 
      ); 
 
    return res.status(200).json({ 
      success: true, 
      message: req.body.is_active 
        ? "Discount activated." 
        : "Discount deactivated.", 
      data: discount, 
    }); 
  } catch (error) { 
    console.error( 
      "Set discount active error:", 
      error 
    ); 
 
    const status = 
      (error as any)?.status ?? 400; 
 
    return res.status(status).json({ 
      success: false, 
      message: 
        error instanceof Error 
          ? error.message 
          : "Failed to update discount status.", 
    }); 
  } 
} 