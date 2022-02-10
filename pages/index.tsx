import { HttpResponse } from "types/http";
import { User } from "types/model";
import type { NextPage } from "next";
import axios from "axios";
import { useMutation, useQuery } from "react-query";
import {
  Box,
  Center,
  Container,
  Heading,
  HStack,
  Text,
} from "@chakra-ui/layout";
import { Table, Tbody, Td, Th, Thead, Tr } from "@chakra-ui/table";
import Head from "next/head";
import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { useForm } from "react-hook-form";
import { useToast } from "@chakra-ui/toast";
import { CircularProgress } from "@chakra-ui/progress";
import React, { useEffect, useMemo, useState } from "react";
import GithubCorner from "components/github-corner";

const fetchUsers = async () => {
  return axios.get<HttpResponse<User[]>>("/api/users").then((res) => res.data);
};

const storeUser = async (fullName: string, email: string) => {
  return axios
    .post<HttpResponse>("/api/users", { fullName, email })
    .then((res) => res.data);
};

const deleteUser = async (id: string) => {
  return axios.delete<HttpResponse>(`/api/users/${id}`).then((res) => res.data);
};

const Home: NextPage = () => {
  const { register, handleSubmit, getValues, reset } = useForm({
    defaultValues: {
      email: "",
      fullName: "",
    },
  });
  const toast = useToast({
    duration: 2000,
    variant: "solid",
    position: "bottom-left",
  });
  const getUsersQuery = useQuery("users", fetchUsers, { retry: false });
  const storeUserQuery = useMutation<HttpResponse, any, Omit<User, "id">>(
    (data) => {
      return storeUser(data.fullName, data.email);
    }
  );
  const deleteUserQuery = useMutation<HttpResponse, any, Pick<User, "id">>(
    (data) => {
      return deleteUser(data.id);
    }
  );
  const [users, setUsers] = useState<User[]>([]);

  const refetchHandler = () => getUsersQuery.refetch();

  const canUseForm = useMemo(
    () => storeUserQuery.isLoading || getUsersQuery.isFetching,
    [storeUserQuery.isLoading, getUsersQuery.isFetching]
  );

  const formSubmitHandler = () => {
    storeUserQuery
      .mutateAsync({
        email: getValues("email"),
        fullName: getValues("fullName"),
      })
      .then((data) => {
        toast({
          description: data.message,
          title: "Success",
          status: "success",
        });
        reset();
        getUsersQuery.refetch();
      })
      .catch((err) => {
        toast({
          description: err?.response?.data?.message ?? "Something wrong",
          title: "Failed",
          status: "error",
        });
      });
  };

  function deleteUserHandler(
    this: Pick<User, "id">,
    e: React.MouseEvent<HTMLButtonElement>
  ) {
    const target = e.target as HTMLButtonElement;
    target.disabled = true;

    deleteUserQuery
      .mutateAsync({
        id: this.id,
      })
      .then((data) => {
        toast({
          description: data.message,
          title: "Success",
          status: "success",
        });
        setUsers((users) => users.filter((user) => user.id !== this.id));
      })
      .catch((err) => {
        toast({
          description: err?.response?.data?.message ?? "Something wrong",
          title: "Failed",
          status: "error",
        });
      });
  }

  useEffect(() => {
    if (getUsersQuery.data?.data) setUsers(getUsersQuery.data.data);
  }, [getUsersQuery.data]);

  return (
    <Container maxWidth="container.lg" py="10">
      <Head>
        <title>Next Users</title>
      </Head>
      <GithubCorner />
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Heading as="h1" size="xl">
          next-mirage
        </Heading>
        <Button
          colorScheme="blue"
          onClick={refetchHandler}
          disabled={getUsersQuery.isFetching}
        >
          Refetch
        </Button>
      </Box>
      <Box mt="2" mb="4">
        {getUsersQuery.isFetching ? (
          <Text color="gray.200">Fetch users...</Text>
        ) : (
          <>
            {getUsersQuery.isSuccess ? (
              <Text color="green.400">Fetch users success!</Text>
            ) : (
              <Text color="red.400">Fetch users failed!</Text>
            )}
          </>
        )}
      </Box>
      <HStack
        spacing="4"
        mb="4"
        as="form"
        onSubmit={handleSubmit(formSubmitHandler)}
      >
        <Input
          id="name"
          type="name"
          placeholder="Full Name"
          disabled={canUseForm}
          {...register("fullName")}
        />
        <Input
          id="email"
          placeholder="Email"
          disabled={canUseForm}
          {...register("email")}
        />
        <Button
          colorScheme="blue"
          width="full"
          type="submit"
          disabled={canUseForm}
        >
          Send
        </Button>
      </HStack>
      {getUsersQuery.isFetching ? (
        <Center mt="8">
          <CircularProgress isIndeterminate color="blue.600" />
        </Center>
      ) : null}
      {getUsersQuery.isSuccess && !getUsersQuery.isFetching ? (
        <>
          {users.length ? (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Id</Th>
                  <Th>Full Name</Th>
                  <Th>Email</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => {
                  return (
                    <Tr key={user.id}>
                      <Td>{user.id}</Td>
                      <Td>{user.fullName}</Td>
                      <Td>{user.email}</Td>
                      <Td>
                        <Button
                          colorScheme="red"
                          onClick={deleteUserHandler.bind({ id: user.id })}
                        >
                          Delete
                        </Button>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          ) : (
            <Text fontWeight="bold" align="center">
              Users not found
            </Text>
          )}
        </>
      ) : null}
    </Container>
  );
};

export default Home;
