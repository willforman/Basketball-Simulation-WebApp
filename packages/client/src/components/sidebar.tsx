import React from "react";
import {
  VStack,
  Button,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel,
  Center,
  Link as ChakraLink,
} from "@chakra-ui/react";

import { Link as GatsbyLink } from "gatsby";

const SideBarButton: React.FC<{ onClick: () => void; text: string }> = ({
  onClick,
  text,
}) => {
  console.log(text);
  return (
    <Button
      _hover={{ backgroundColor: "purple.500" }}
      variant="ghost"
      borderRadius="0"
      width="100%"
      onClick={onClick}
    >
      {text}
    </Button>
  );
};

const NavGroup: React.FC<{ overallName: string; names: string[] }> = ({
  overallName,
  names,
}) => {
  return (
    <VStack color="white" backgroundColor="purple.600" spacing="0" width="100%">
      <ChakraLink as={GatsbyLink} to={`/${overallName}/`}>
        <b>{overallName}</b>
      </ChakraLink>
      <VStack backgroundColor="purple.600" spacing={-2} width="100%">
        {names.map((name: string) => (
          <ChakraLink
            as={GatsbyLink}
            to={`/${overallName}/${name}/`}
            key={name}
          >
            {name}
          </ChakraLink>
        ))}
      </VStack>
    </VStack>
  );
};

const SimButton: React.FC<{ actions: string[] }> = ({ actions }) => {
  return (
    <Accordion allowToggle width="100%" borderColor="purple.600" color="white">
      <AccordionItem bg="purple.600">
        <AccordionButton paddingLeft={0} paddingRight={0}>
          <Center width="100%" bg="purple.600">
            <b>sim</b>
          </Center>
        </AccordionButton>
        <AccordionPanel
          bg="purple.600"
          width="100%"
          paddingLeft={0}
          paddingRight={0}
        >
          {actions.map((action: string) => (
            <Button
              key={action}
              _hover={{ backgroundColor: "purple.500" }}
              variant="ghost"
              borderRadius="0"
              width="100%"
            >
              {action}
            </Button>
          ))}
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
};

export const SideBar: React.FC = () => {
  return (
    <VStack
      width="140px"
      height="100vh"
      backgroundColor="purple.600"
      spacing={5}
    >
      <SimButton actions={["1 game", "season"]}></SimButton>
      <NavGroup overallName={"league"} names={["standings"]}></NavGroup>
      <NavGroup overallName={"team"} names={["roster"]}></NavGroup>
    </VStack>
  );
};
