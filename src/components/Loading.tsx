import type React from "react";
import { Flex } from "@radix-ui/themes";
import { Spinner } from "@radix-ui/themes";

export const Loading: React.FC = () => {
    return (
        <Flex
            align="center"
            justify="center"
            style={{
                minHeight: "100vh",
                width: "100%",
            }}
        >
            <Spinner size="3" />
        </Flex>
    );
};

