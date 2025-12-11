export type NestedPayload<T, Id extends string | number> = {
    create: T[];
    update: T[];
    delete: Id[];
};

type IdValue = string | number | null | undefined;

/**
 * Compara dois itens. Se não for passado um comparador, verifica igualdade estrutural superficial.
 */
function shallowEqual<T extends Record<string, unknown>>(a: T, b: T): boolean {
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;

    for (const key of aKeys) {
        if (a[key] !== b[key]) return false;
    }

    return true;
}

/**
 * Gera o payload nested: { create, update, delete }.
 *
 * - T → tipo do item (ex RecipeFormValue ou RecipeItemFormValue)
 * - Id → tipo do identificador (ex number)
 * - original → array vindo da API
 * - edited → array vindo do formulário
 *
 * Regras:
 * - Se não tem id → create
 * - Se tem id mas não existe mais em edited → delete
 * - Se tem id e houve mudança → update
 */
export function buildNestedPayload<
    T extends Record<string, unknown>,
    Id extends string | number,
>(params: {
    original: T[];
    edited: T[];
    getId: (item: T) => IdValue;
    isEqual?: (a: T, b: T) => boolean;
}): NestedPayload<T, Id> {
    const { original, edited, getId } = params;
    const compare = params.isEqual ?? shallowEqual;

    const create: T[] = [];
    const update: T[] = [];
    const del: Id[] = [];

    const originalIndex: Record<string, T> = {};
    for (const item of original) {
        const id = getId(item);
        if (id !== undefined && id !== null) {
            originalIndex[String(id)] = item;
        }
    }

    const editedIds = new Set<string>();

    // CREATE & UPDATE
    for (const editedItem of edited) {
        const id = getId(editedItem);

        if (id === undefined || id === null) {
            // Novo item
            create.push(editedItem);
            continue;
        }

        const key = String(id);
        editedIds.add(key);

        const originalItem = originalIndex[key];
        if (!originalItem) {
            // Id informado mas não existia no original => create
            create.push(editedItem);
            continue;
        }

        // Verifica se houve alterações
        if (!compare(originalItem, editedItem)) {
            update.push(editedItem);
        }
    }

    // DELETE
    for (const orig of original) {
        const id = getId(orig);
        if (id === undefined || id === null) continue;

        const key = String(id);
        if (!editedIds.has(key)) {
            del.push(id as Id);
        }
    }

    return { create, update, delete: del };
}
