/**
 * Dependency Injection Container and Bootstrap
 *
 * This module initializes all dependencies and wires them together.
 * Following Dependency Inversion Principle - high-level modules depend on abstractions.
 */

import type { PrismaClient } from "@prisma/client";
import { prisma } from "./database.js";

// Import all classes
import { UserRepository } from "../repository/user.repository.js";
import { DocumentRepository } from "../repository/document.repository.js";
import { NotificationRepository } from "../repository/notification.repository.js";
import { TokenService } from "../utils/auth.utils.js";
import { AuthService } from "../services/auth.js";
import { DocumentService } from "../services/docs.js";
import { PermissionService } from "../services/permissionService.js";
import { NotificationService } from "../services/notification.service.js";
import { AuthController } from "../api/auth.controller.js";
import { DocumentController } from "../api/document.controller.js";
import { NotificationController } from "../api/notification.controller.js";

// Import interfaces for type safety
import type {
  IUserRepository,
  IDocumentRepository,
  INotificationRepository,
  ITokenService,
  IAuthService,
  IDocumentService,
  IPermissionService,
  INotificationService,
} from "../interfaces/index.js";

// ============================================================================
// Container Implementation
// ============================================================================

type Factory<T> = () => T;

interface Registration<T> {
  factory: Factory<T>;
  instance?: T;
  singleton: boolean;
}

export class Container {
  private registrations = new Map<string, Registration<unknown>>();

  registerSingleton<T>(key: string, factory: Factory<T>): void {
    this.registrations.set(key, { factory, singleton: true });
  }

  registerTransient<T>(key: string, factory: Factory<T>): void {
    this.registrations.set(key, { factory, singleton: false });
  }

  get<T>(key: string): T {
    const registration = this.registrations.get(key);
    if (!registration) {
      throw new Error(
        `Dependency '${key}' is not registered in the container.`,
      );
    }

    if (registration.singleton) {
      if (!registration.instance) {
        registration.instance = registration.factory();
      }
      return registration.instance as T;
    }

    return registration.factory() as T;
  }

  has(key: string): boolean {
    return this.registrations.has(key);
  }

  clear(): void {
    this.registrations.clear();
  }
}

// ============================================================================
// Dependency Keys
// ============================================================================

export const DEPS = {
  // Infrastructure
  PRISMA: "prisma",

  // Repositories
  USER_REPOSITORY: "userRepository",
  DOCUMENT_REPOSITORY: "documentRepository",
  NOTIFICATION_REPOSITORY: "notificationRepository",

  // Services
  TOKEN_SERVICE: "tokenService",
  AUTH_SERVICE: "authService",
  DOCUMENT_SERVICE: "documentService",
  PERMISSION_SERVICE: "permissionService",
  NOTIFICATION_SERVICE: "notificationService",

  // Controllers
  AUTH_CONTROLLER: "authController",
  DOCUMENT_CONTROLLER: "documentController",
  NOTIFICATION_CONTROLLER: "notificationController",
} as const;

// ============================================================================
// Container Instance & Bootstrap
// ============================================================================

export const container = new Container();

/**
 * Initialize the DI container with all dependencies.
 * Call this once at application startup before using any dependencies.
 */
export function bootstrapContainer(prismaClient: PrismaClient = prisma): void {
  // Infrastructure
  container.registerSingleton(DEPS.PRISMA, () => prismaClient);

  // Repositories
  container.registerSingleton<IUserRepository>(
    DEPS.USER_REPOSITORY,
    () => new UserRepository(container.get(DEPS.PRISMA)),
  );

  container.registerSingleton<IDocumentRepository>(
    DEPS.DOCUMENT_REPOSITORY,
    () => new DocumentRepository(container.get(DEPS.PRISMA)),
  );

  container.registerSingleton<INotificationRepository>(
    DEPS.NOTIFICATION_REPOSITORY,
    () => new NotificationRepository(container.get(DEPS.PRISMA)),
  );

  // Services
  container.registerSingleton<ITokenService>(
    DEPS.TOKEN_SERVICE,
    () => new TokenService(),
  );

  container.registerSingleton<IAuthService>(
    DEPS.AUTH_SERVICE,
    () =>
      new AuthService(
        container.get(DEPS.USER_REPOSITORY),
        container.get(DEPS.TOKEN_SERVICE),
      ),
  );

  container.registerSingleton<INotificationService>(
    DEPS.NOTIFICATION_SERVICE,
    () => new NotificationService(container.get(DEPS.NOTIFICATION_REPOSITORY)),
  );

  container.registerSingleton<IDocumentService>(
    DEPS.DOCUMENT_SERVICE,
    () =>
      new DocumentService(
        container.get(DEPS.DOCUMENT_REPOSITORY),
        container.get(DEPS.NOTIFICATION_SERVICE),
      ),
  );

  container.registerSingleton<IPermissionService>(
    DEPS.PERMISSION_SERVICE,
    () => new PermissionService(container.get(DEPS.PRISMA)),
  );

  // Controllers
  container.registerSingleton(
    DEPS.AUTH_CONTROLLER,
    () => new AuthController(container.get(DEPS.AUTH_SERVICE)),
  );

  container.registerSingleton(
    DEPS.DOCUMENT_CONTROLLER,
    () => new DocumentController(container.get(DEPS.DOCUMENT_SERVICE)),
  );

  container.registerSingleton(
    DEPS.NOTIFICATION_CONTROLLER,
    () =>
      new NotificationController(
        container.get(DEPS.NOTIFICATION_SERVICE),
        container.get(DEPS.NOTIFICATION_REPOSITORY),
      ),
  );
}

// Helper functions to get typed dependencies
export function getAuthController(): AuthController {
  return container.get(DEPS.AUTH_CONTROLLER);
}

export function getDocumentController(): DocumentController {
  return container.get(DEPS.DOCUMENT_CONTROLLER);
}

export function getNotificationController(): NotificationController {
  return container.get(DEPS.NOTIFICATION_CONTROLLER);
}
