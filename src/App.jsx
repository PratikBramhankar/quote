import { useEffect, useState } from 'react'
import axios from 'axios'
import './App.css'
import 'bootstrap/dist/css/bootstrap.css';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Swal from 'sweetalert2'


function App() {

  const [data, setData] = useState([])
  const [name, setName] = useState('')
  const [quote, setQuote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("Add")
  const [id, setId] = useState(null)
  const [search, setSearch] = useState("");
  const [ipName, setIpName] = useState(false)
  const [ipQuote, setIpQuote] = useState(false)
  const [cancel, setCancel] = useState(false)

  const instance = axios.create({
    baseURL: `http://${import.meta.env.VITE_HOST}/api`

  });

  const handleSubmit = (e, id) => {
    e.preventDefault()

    if (name !== "" && quote !== "") {
      let res = { name: name, detail: quote }
      setLoading(true)
      if (id) {
        instance.patch(`/quote/${id}`, res)
          .then((data) => {
            setData((prev) =>
              [...prev.filter((item) => {
                if (item.id === id) {
                  item.name = data.data.data['name']
                  item.detail = data.data.data['detail']
                }
                return item
              })
              ])
            toast.success(data.data.message, {
              position: 'bottom-right',
            })
          })
          .finally(() => {
            setLoading(false)
            setMessage("Add")
            setId(null)
            setIpName(false)
            setIpQuote(false)
          })
      }
      else {
        instance.post('/quote/', res)
          .then((data) => {
            if (data.data.data) {
              setData((prev) => [...prev, data.data.data])
              toast.success(data.data.message, {
                position: 'bottom-right',
              })
            } else {
              if (data.data.name[0]) {
                toast.warning(data.data.name[0].replace("this", "name"), {
                  position: 'bottom-right',
                })
              }
              if (data.data.detail[0]) {
                toast.warning(data.data.detail[0].replace("this", "quote"), {
                  position: 'bottom-right',
                })
              }
            }
          })
          .finally(() => {
            setLoading(false)
            setIpName(false)
            setIpQuote(false)
          })
      }
      setName('')
      setQuote('')
      setCancel(false)
    }
    else {
      name ? setIpName(false) : setIpName(true)
      quote ? setIpQuote(false) : setIpQuote(true)
    }
  }

  const handleCancel = () => {
    setId(null)
    setMessage("Add")
    setCancel(false)
    setName("")
    setQuote("")
  }

  const handleUpdate = (id) => {
    setMessage("Edit")
    window.scrollTo(0, 0)
    setCancel(true)
    instance.get(`/quote/${id}`)
      .then((data) => {
        setName(data.data.data['name'])
        setQuote(data.data.data['detail'])
        setId(id)
      })
  }

  const handleDelete = (itemId) => {

    // toast.error(data.data.message, {
    //   position: 'bottom-right',
    // })

    if (itemId === id) {
      setCancel(false)
      setMessage("Add")
    }
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!"
    }).then((result) => {
      if (result.isConfirmed) {

        instance.delete(`/quote/${itemId}`)
          .then((data) => {
            setData((prev) => [...prev.filter((item) => itemId !== item.id)])
          })

        Swal.fire({
          title: "Deleted!",
          text: " Your card has been deleted.",
          icon: "success",
        })
      }
    })
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    instance.get('/quote/', {
      params: {
        "search": e.target.value
      }
    }).then((data) => setData(data.data.data))
  }

  useEffect(() => {
    instance.get('/quote/')
      .then((data) => setData(data.data.data))

  }, [])


  return (
    <>
      <ToastContainer />
      <section className='bg-dark-subtle min-vh-100'>
        <nav className='container-fluid mb-3 bg-dark shadow-sm'>
          <div className='row p-2'>
            <div className='col-lg-9 col-md-8 col-sm-7 col-12 text-center text-sm-start mb-2 mb-sm-0'>
              <h2 style={{ 'margin': '0px', 'fontFamily': 'cursive', color: 'white' }}>Quotes</h2>
            </div>
            <div className='col-lg-3 col-md-4 col-sm-5 col-12 text-center text-sm-end d-flex justify-content-center align-items-center'>
              <input className='form-control form-control-sm' type="search" value={search} onChange={handleSearch} placeholder='Search here'></input>
            </div>
          </div>
        </nav>
        <div className='container-fluid mb-3'>
          <div className='row'>
            <div className='col-lg-6 offset-lg-3 col-md-8 offset-md-2 col-sm-10 offset-sm-1 col-12'>
              <div className="card">
                <div className="card-header fw-bold">
                  {message} Quotes
                </div>
                <div className="card-body">
                  <form onSubmit={id ? (e) => handleSubmit(e, id) : (e) => handleSubmit(e, id)}>
                    <div className="mb-3">
                      <label htmlFor="exampleInputName" className="form-label">Name</label>
                      <input type="text" value={name} className="form-control" onChange={(e) => setName(e.target.value)} id="exampleInputName"></input>
                      {ipName && <small className='text-danger'>* This field is mandatory</small>}
                    </div>
                    <div className="mb-3">
                      <label htmlFor="exampleInputQuote" className="form-label">Quote</label>
                      <input type="text" value={quote} className="form-control" onChange={(e) => setQuote(e.target.value)} id="exampleInputQuote"></input>
                      {ipQuote && <small className='text-danger'>* This field is mandatory</small>}
                    </div>
                    {loading ? <button type="submit" className="btn btn-primary btn-sm" disabled>
                      <div className="spinner-border spinner-border-sm text-light" role="status"></div> Loading
                    </button>
                      : <button type="submit" className="btn btn-primary btn-sm">Submit</button>}
                    {cancel && <button onClick={handleCancel} className="btn btn-danger btn-sm ms-1">Cancel</button>}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <section className='container-fluid'>
          <div className='row g-2'>
            {
              data != '' ? data.map((data) => (
                <div className="col-lg-3 col-md-4 col-12" key={data?.id}>
                  <div className="card border-black h-100">
                    <div className="card-header">
                      <div className='d-flex justify-content-end gap-2'>
                        <i className="fa-solid fa-pen-to-square" onClick={() => handleUpdate(data.id)}></i>
                        <i className="fa-solid fa-trash" onClick={() => handleDelete(data.id)}></i>
                      </div>
                    </div>
                    <div className="card-body">
                      <p className="card-text">{data?.detail}</p>
                      <div className='text-end me-3'>
                        <figcaption className="blockquote-footer mb-0">
                          <cite title="Name">{data?.name}</cite>
                        </figcaption>
                      </div>
                    </div>
                  </div>
                </div>
              )) : (
                <div className='p-3'>
                  <h4 className='text-danger text-center'>No cards added yet!</h4>
                </div>
              )
            }
          </div>
        </section>
      </section>
    </>
  )
}

export default App
