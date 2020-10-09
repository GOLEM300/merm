import React, { useState, useCallback, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import LinkCard from "../components/LinkCard";
import { Loader } from "../components/Loader";
import { AuthContext } from "../context/AuthContet";
import { useHttp } from "../Hooks/http.hook";

function DetailPage() {
  const { token } = useContext(AuthContext);
  const { request, loading } = useHttp();
  const [link, setLink] = useState(null);
  const linkId = useParams().id;

  const getLink = useCallback(async () => {
    try {
      const fetched = await request(`/api/link/${linkId}`, "GET", null, {
        Authorization: `Bearer ${token}`
      });
      setLink(fetched)
    } catch (e) {}
  }, [token, linkId, request]);

  useEffect(() => {
    getLink();
  }, [getLink]);

  if (loading) {
    return <Loader />;
  }

  return <div>{!loading && link && <LinkCard link={link} />}</div>;
}

export default DetailPage;
