
export interface KOComponent {
    viewModel: () => void;
    template: string;
    docs: Docs;
}

interface Docs {
    filename: string;
    filepath: string;
}

interface AllComponents {
    [s: string]: KOComponent;
}

/**
 * Gets all registered components
 */
export function getAllComponents(): AllComponents {
    let allComponents: KOComponent;
    Object.entries(ko.components).find((x) => {
        const value = x[1];
        
        if (typeof value === "object") {
            if (typeof value["knockout-component-documentor"] === "object") {
                allComponents = value;
                return true;
            }
        }
    });

    if (allComponents === undefined) {
        throw "Couldn't find knockout registered components";
    }
    
    return allComponents as any;
}