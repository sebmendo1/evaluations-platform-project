"use client";

import { useSyncExternalStore } from "react";

import { defaultRole, isRole, roles, type Role } from "@/lib/domain/roles";
import { persist, ROLE_COOKIE } from "@/lib/prefs";

function subscribe(onStoreChange: () => void) {
  const observer = new MutationObserver(onStoreChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-role"],
  });
  return () => observer.disconnect();
}

function getSnapshot(): Role {
  const value = document.documentElement.dataset.role;
  return isRole(value) ? value : defaultRole;
}

function getServerSnapshot(): Role {
  return defaultRole;
}

/**
 * Reads the acting role off the document, so any surface can gate on it without a
 * provider and without a setState in an effect.
 *
 * Real enforcement belongs on a server (03 §Acceptance says senior-only types are
 * "enforced server-side"); this prototype has none, and the conformance matrix
 * records that as deferred.
 */
export function useActingRole(): Role {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function setActingRole(next: Role) {
  document.documentElement.dataset.role = next;
  persist(ROLE_COOKIE, next);
}

export function RoleChoice() {
  const active = useActingRole();

  return (
    <div className="rolelist" role="radiogroup" aria-label="Acting role">
      {roles.map((role) => (
        <button
          key={role.id}
          type="button"
          role="radio"
          aria-checked={active === role.id}
          className="rolerow"
          onClick={() => setActingRole(role.id)}
        >
          <span className="rolerow-mark" aria-hidden="true" />
          <span className="rolerow-text">
            <span className="rolerow-name">
              {role.label} <span className="mono">{role.person}</span>
            </span>
            <span className="rolerow-owns">{role.owns}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
